import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const clientTypes = join(process.cwd(), "node_modules", ".prisma", "client", "index.d.ts");
const target = join(process.cwd(), "node_modules", "@prisma", "client", "default.d.ts");
const contents = 'export * from "../../.prisma/client";\n';

if (!existsSync(clientTypes)) {
  process.exit(0);
}

writeFileSync(target, contents);
