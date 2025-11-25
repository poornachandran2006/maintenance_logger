export const calculateWorkDuration = (startTime, finishTime) => {
  const start = new Date(startTime);
  const finish = new Date(finishTime);
  const durationMinutes = (finish - start) / (1000 * 60);
  return durationMinutes;
}
