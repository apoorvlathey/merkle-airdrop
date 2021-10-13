export const fs = require("fs");
export const saveToFile = (filename: string, data: any) => {
  try {
    const timeStamp = new Date().valueOf();
    fs.writeFileSync(
      `./outputs/${filename}_${timeStamp}.json`,
      JSON.stringify(data)
    );
  } catch (err) {
    console.error(err);
  }
};
