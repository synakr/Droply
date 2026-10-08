import "dotenv/config";
import readline from "node:readline";
import { login, logout, whoami } from "./commands/auth.js";
import { cat, download, ls, remove, rename, upload } from "./commands/files.js";

const printBanner = () => {
  console.log(`
╔══════════════════════════════════════════╗
║             DROPly CLI v1.0              ║
║        SECURE CLOUD FILE STORAGE         ║
╚══════════════════════════════════════════╝

Type 'help' for commands.
`);
};

const printHelp = () => {
  console.log(`
AUTH
  login                         Sign in to DROPly
  logout                        Sign out
  whoami                        Show current account

FILES
  ls                            List cloud files
  upload <local-file>           Upload a file
  download <file> [destination] Download a file
  cat <file>                    Read a text file
  rm <file>                     Delete a file
  rename <old> <new>            Rename a file

GENERAL
  help                          Show this help
  clear                         Clear terminal
  exit                          Exit DROPly

Examples:
  upload ./report.pdf
  ls
  download report.pdf
  download report.pdf ./downloads/report.pdf
  cat notes.txt
  rename old.txt new.txt
  rm old.txt
`);
};

const splitArgs = (line: string) => {
  const matches = line.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  return matches.map((arg) =>
    arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg,
  );
};

const execute = async (
  line: string,
  rl: readline.Interface,
): Promise<boolean> => {
  const args = splitArgs(line);

  if (!args.length) return true;

  const [command, ...rest] = args;

  switch (command.toLowerCase()) {
    case "help":
      printHelp();
      break;

    case "login":
      await login(rl);
      break;

    case "logout":
      await logout();
      break;

    case "whoami":
      await whoami();
      break;

    case "ls":
    case "list":
      await ls();
      break;

    case "upload":
      await upload(rest[0]);
      break;

    case "download":
    case "get":
      await download(rest[0], rest[1]);
      break;

    case "cat":
    case "read":
      await cat(rest[0]);
      break;

    case "rm":
    case "delete":
      await remove(rest[0]);
      break;

    case "rename":
    case "mv":
      await rename(rest[0], rest[1]);
      break;

    case "clear":
    case "cls":
      console.clear();
      break;

    case "exit":
    case "quit":
      return false;

    default:
      console.log(`UNKNOWN COMMAND: ${command}. Type 'help'.`);
  }

  return true;
};

const main = async () => {
  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "droply> ",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    rl.pause();

    try {
      const keepRunning = await execute(line.trim(), rl);

      if (!keepRunning) {
        rl.close();
        return;
      }
    } catch (error) {
      console.log(
        `ERROR: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    rl.resume();
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nGoodbye.");
    process.exit(0);
  });
};

void main();
