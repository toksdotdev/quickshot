const handleProcess = (
  exit: boolean = true,
  err: number | NodeJS.Signals | Error
) => {
  console.log(`Terminating with exit code: ${err}`);
  if (exit) process.exit();
};

/**
 * Shutdown application
 */

export const shutdownGracefully = () => {
  process.on("exit", (err) => handleProcess(true, err));

  // Catch Ctrl+C event
  process.on("SIGINT", (err) => handleProcess(true, err));

  // Catch "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", (err) => handleProcess(true, err));
  process.on("SIGUSR2", (err) => handleProcess(true, err));

  // Catches uncaught exceptions
  process.on("uncaughtException", (err) => handleProcess(true, err));
};
