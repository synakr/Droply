import {
  deleteFile,
  downloadFile,
  findFile,
  formatSize,
  listFiles,
  readTextFile,
  renameFile,
  uploadFile,
  type StoredFile,
} from "../client/files.js";

const printFiles = (files: StoredFile[]) => {
  if (!files.length) {
    console.log("NO FILES FOUND.");
    return;
  }

  console.log("\nFILES");
  console.log("────────────────────────────────────────────────────────────");
  console.log(
    `${"NAME".padEnd(32)} ${"SIZE".padStart(10)}  ${"TYPE".padEnd(24)}`
  );
  console.log("────────────────────────────────────────────────────────────");

  for (const file of files) {
    const name = file.name.length > 31
      ? `${file.name.slice(0, 28)}...`
      : file.name;

    const type = (file.mime_type || "unknown").slice(0, 23);

    console.log(
      `${name.padEnd(32)} ${formatSize(file.size).padStart(10)}  ${type.padEnd(24)}`
    );
  }

  console.log("────────────────────────────────────────────────────────────");
  console.log(`${files.length} file(s)\n`);
};

export const ls = async () => {
  try {
    printFiles(await listFiles());
  } catch (error) {
    printError(error);
  }
};

export const upload = async (path: string | undefined) => {
  if (!path) {
    console.log("Usage: upload <local-file>");
    return;
  }

  try {
    console.log(`UPLOADING: ${path}`);
    const file = await uploadFile(path);
    console.log(`✓ UPLOADED: ${file.name}`);
  } catch (error) {
    printError(error);
  }
};

export const download = async (
  name: string | undefined,
  destination?: string
) => {
  if (!name) {
    console.log("Usage: download <file> [destination]");
    return;
  }

  try {
    const file = await findFile(name);

    if (!file) {
      console.log(`FILE NOT FOUND: ${name}`);
      return;
    }

    console.log(`DOWNLOADING: ${file.name}`);
    const output = await downloadFile(file, destination);
    console.log(`✓ SAVED TO: ${output}`);
  } catch (error) {
    printError(error);
  }
};

export const remove = async (name: string | undefined) => {
  if (!name) {
    console.log("Usage: rm <file>");
    return;
  }

  try {
    const file = await findFile(name);

    if (!file) {
      console.log(`FILE NOT FOUND: ${name}`);
      return;
    }

    await deleteFile(file);
    console.log(`✓ DELETED: ${file.name}`);
  } catch (error) {
    printError(error);
  }
};

export const cat = async (name: string | undefined) => {
  if (!name) {
    console.log("Usage: cat <file>");
    return;
  }

  try {
    const file = await findFile(name);

    if (!file) {
      console.log(`FILE NOT FOUND: ${name}`);
      return;
    }

    if (
      file.mime_type &&
      !file.mime_type.startsWith("text/") &&
      file.mime_type !== "application/json" &&
      file.mime_type !== "application/javascript"
    ) {
      console.log(`CAT ONLY SUPPORTS TEXT FILES: ${file.mime_type}`);
      return;
    }

    console.log("\n" + await readTextFile(file));
  } catch (error) {
    printError(error);
  }
};

export const rename = async (
  oldName: string | undefined,
  newName: string | undefined
) => {
  if (!oldName || !newName) {
    console.log("Usage: rename <old-name> <new-name>");
    return;
  }

  try {
    const file = await findFile(oldName);

    if (!file) {
      console.log(`FILE NOT FOUND: ${oldName}`);
      return;
    }

    await renameFile(file, newName);
    console.log(`✓ RENAMED: ${oldName} → ${newName}`);
  } catch (error) {
    printError(error);
  }
};

const printError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`ERROR: ${message}`);
};
