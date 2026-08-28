import { spawn } from "node:child_process";

export function createCommandRunner(options = {}) {
  const { spawnProcess = spawn } = options;

  return function run(command, argumentsList, runOptions = {}) {
    const { cwd, env, stdio = "pipe" } = runOptions;

    return new Promise((resolve, reject) => {
      const child = spawnProcess(command, argumentsList, {
        cwd,
        env: { ...process.env, ...env },
        shell: false,
        stdio,
      });
      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk;
      });
      child.on("error", (error) => {
        reject(new Error(`Could not run ${command}: ${error.message}`));
      });
      child.on("close", (exitCode) => {
        resolve({ command, exitCode: exitCode ?? 1, stderr, stdout });
      });
    });
  };
}

export async function commandExists(command, runner) {
  try {
    const result = await runner(command, ["--version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

export function assertSuccessful(result, nextStep) {
  if (result.exitCode === 0) {
    return result;
  }

  const detail = result.stderr.trim() || result.stdout.trim() || "No output.";
  throw new Error(`${result.command} failed. ${detail}\nNext step: ${nextStep}`);
}
