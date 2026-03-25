// scripts/mergeUseCaseKeys.ts
/**
 * Merge "from" useCaseKey into "to" useCaseKey (registre vivant).
 *
 * DRY RUN (safe):
 *   npx ts-node --transpile-only scripts/mergeUseCaseKeys.ts --from=finance__calcul-de-solvabilit --to=finance__calcul-de-solvabilite
 *
 * APPLY (destructif):
 *   npx ts-node --transpile-only scripts/mergeUseCaseKeys.ts --apply --from=finance__calcul-de-solvabilit --to=finance__calcul-de-solvabilite
 *
 * Optional:
 *   --setTitle="calcul de solvabilité"
 *   --setSector="finance"
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Args = {
  apply: boolean;
  from?: string;
  to?: string;
  setTitle?: string;
  setSector?: string;
};

function parseArgs(argv: string[]): Args {
  const out: Args = { apply: false };

  for (const raw of argv) {
    if (raw === "--apply") out.apply = true;

    if (raw.startsWith("--from=")) out.from = raw.slice("--from=".length).trim();
    if (raw.startsWith("--to=")) out.to = raw.slice("--to=".length).trim();

    if (raw.startsWith('--setTitle=')) out.setTitle = raw.slice('--setTitle='.length).trim();
    if (raw.startsWith('--setSector=')) out.setSector = raw.slice('--setSector='.length).trim();
  }

  return out;
}

function must(v: string | undefined, name: string): string {
  const x = (v || "").trim();
  if (!x) throw new Error(`Missing arg: ${name}`);
  return x;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const from = must(args.from, "--from");
  const to = must(args.to, "--to");

  console.log("==============================================");
  console.log("MERGE UseCases — registre vivant");
  console.log(`Mode: ${args.apply ? "APPLY (destructif)" : "DRY RUN (safe)"}`);
  console.log(`FROM: ${from}`);
  console.log(`TO:   ${to}`);
  if (args.setTitle) console.log(`setTitle: ${args.setTitle}`);
  if (args.setSector) console.log(`setSector: ${args.setSector}`);
  console.log("==============================================\n");

  if (from === to) throw new Error("from === to (rien à faire)");

  const [fromUc, toUc] = await Promise.all([
    prisma.useCase.findUnique({ where: { key: from } }),
    prisma.useCase.findUnique({ where: { key: to } }),
  ]);

  if (!fromUc) {
    console.log(`✅ FROM n’existe pas (${from}). Rien à faire.`);
    return;
  }

  // Charger states FROM et TO
  const [fromStates, toStates] = await Promise.all([
    prisma.useCaseObligationState.findMany({
      where: { useCaseKey: from },
      select: {
        id: true,
        obligationId: true,
        status: true,
        priority: true,
        owner: true,
        dueDate: true,
        notes: true,
        lastAuditId: true,
        lastAuditAt: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    prisma.useCaseObligationState.findMany({
      where: { useCaseKey: to },
      select: {
        id: true,
        obligationId: true,
      },
    }),
  ]);

  const toByObligationId = new Map<string, { id: string }>();
  for (const s of toStates) toByObligationId.set(String(s.obligationId), { id: s.id });

  console.log(`FROM useCase exists: ${fromUc.key} | title="${fromUc.title}" | sector=${fromUc.sector}`);
  console.log(
    `TO useCase exists:   ${toUc ? `${toUc.key} | title="${toUc.title}" | sector=${toUc.sector}` : "(absent)"}`
  );
  console.log(`FROM states: ${fromStates.length}`);
  console.log(`TO states:   ${toStates.length}\n`);

  // Calcul collisions (même obligationId déjà présent sur TO)
  let collisions = 0;
  for (const s of fromStates) {
    if (toByObligationId.has(String(s.obligationId))) collisions += 1;
  }

  console.log(`Collisions (obligationId déjà présent sur TO): ${collisions}`);
  console.log("");

  if (!args.apply) {
    console.log("✅ DRY RUN fini (aucune modif).");
    return;
  }

  // APPLY
  await prisma.$transaction(async (tx) => {
    // 1) S’assurer que TO existe
    const finalTo = await tx.useCase.upsert({
      where: { key: to },
      create: {
        key: to,
        title: args.setTitle ?? (toUc?.title ?? fromUc.title),
        sector: args.setSector ?? (toUc?.sector ?? fromUc.sector),
      },
      update: {
        title: args.setTitle ?? (toUc?.title ?? fromUc.title),
        sector: args.setSector ?? (toUc?.sector ?? fromUc.sector),
      },
      select: { key: true },
    });

    // 2) Pour chaque state FROM :
    //    - si pas de collision => update useCaseKey
    //    - si collision => migrer history vers target, fusionner champs utiles, puis delete source state
    for (const s of fromStates) {
      const oid = String(s.obligationId);
      const target = toByObligationId.get(oid);

      if (!target) {
        // simple move
        await tx.useCaseObligationState.update({
          where: { id: s.id },
          data: { useCaseKey: finalTo.key },
        });
        continue;
      }

      // collision: on fusionne dans le target
      // 2a) déplacer l’historique de s.id -> target.id
      await tx.useCaseObligationHistory.updateMany({
        where: { stateId: s.id },
        data: { stateId: target.id },
      });

      // 2b) fusionner quelques champs si target est "vide" (ou si source est plus récent)
      const targetFull = await tx.useCaseObligationState.findUnique({
        where: { id: target.id },
        select: {
          id: true,
          status: true,
          priority: true,
          owner: true,
          dueDate: true,
          notes: true,
          lastAuditId: true,
          lastAuditAt: true,
          updatedAt: true,
        },
      });

      if (targetFull) {
        const sourceIsNewer = s.updatedAt > targetFull.updatedAt;

        await tx.useCaseObligationState.update({
          where: { id: targetFull.id },
          data: {
            // si source plus récent, on prend son status/priority, sinon on garde
            status: sourceIsNewer ? (s.status as any) : undefined,
            priority: sourceIsNewer ? (s.priority as any) : undefined,

            // owner/dueDate/notes : on remplit si vide côté target, sinon on garde (sauf si source plus récent)
            owner: sourceIsNewer ? (s.owner ?? targetFull.owner) : (targetFull.owner ?? s.owner ?? null),
            dueDate: sourceIsNewer ? (s.dueDate ?? targetFull.dueDate) : (targetFull.dueDate ?? s.dueDate ?? null),
            notes: sourceIsNewer ? (s.notes ?? targetFull.notes) : (targetFull.notes ?? s.notes ?? null),

            // lastAudit*: on garde le plus récent
            lastAuditAt:
              !targetFull.lastAuditAt
                ? s.lastAuditAt
                : !s.lastAuditAt
                ? targetFull.lastAuditAt
                : s.lastAuditAt > targetFull.lastAuditAt
                ? s.lastAuditAt
                : targetFull.lastAuditAt,

            lastAuditId:
              !targetFull.lastAuditAt || (s.lastAuditAt && targetFull.lastAuditAt && s.lastAuditAt > targetFull.lastAuditAt)
                ? (s.lastAuditId ?? targetFull.lastAuditId)
                : targetFull.lastAuditId,
          },
        });
      }

      // 2c) delete source state (après migration history)
      await tx.useCaseObligationState.delete({ where: { id: s.id } });
    }

    // 3) Supprimer l’ancienne UseCase si plus aucun state ne pointe dessus
    const remaining = await tx.useCaseObligationState.count({ where: { useCaseKey: from } });
    if (remaining === 0) {
      await tx.useCase.delete({ where: { key: from } }).catch(() => null);
    } else {
      // sécurité : si quelque chose reste, on ne supprime pas
      console.log(`⚠️ Safety: ${remaining} state(s) restent sur FROM, useCase non supprimée.`);
    }
  });

  console.log("\n✅ APPLY terminé.");

  // mini check après
  const [afterFrom, afterTo] = await Promise.all([
    prisma.useCaseObligationState.count({ where: { useCaseKey: from } }),
    prisma.useCaseObligationState.count({ where: { useCaseKey: to } }),
  ]);

  console.log(`Après: FROM states=${afterFrom} | TO states=${afterTo}`);
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });