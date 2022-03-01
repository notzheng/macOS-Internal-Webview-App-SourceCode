const path = require("path");
const fs = require("fs").promises;

const sourceMap = require("source-map");

const {
  logger,
  normalizeFilePath,
  checkIsFilePathExists,
  smartWriteFile,
} = require("./utils");

const MATCH_MAP_FILE = /\.map$/iu;

/**
 * @param {string} input sourcemap
 *
 * @returns {object}
 */
const parseSourceMap = async (sourceMapFilePath) => {
  try {
    const fileContent = await fs.readFile(sourceMapFilePath, "utf-8");

    if (!fileContent) {
      return {};
    }

    const sourceMapJson = JSON.parse(fileContent);

    const consumer = await new sourceMap.SourceMapConsumer(sourceMapJson);

    const result = consumer.sources.reduce((map, item) => {
      const normalizedFilePath = normalizeFilePath(
        item.replace("webpack://", "")
      );

      try {
        const contents = consumer.sourceContentFor(item);
        if (contents) {
          map[normalizedFilePath] = contents;
        } else {
          logger.warning("⚠️", item, "no contents");
        }
      } catch (e) {
        logger.warning("⚠️", item, e);
      }
      return map;
    }, {});

    consumer.destroy();
    return result;
  } catch (e) {
    console.error(e)
    logger.error(`❌ Error occurs when parse file ${sourceMapFilePath}: ${e}`);
    return {};
  }
};

const reverseSourceMap = async (sourceMapFilePath, outputDir) => {
  const reversedFileMap = await parseSourceMap(sourceMapFilePath);

  const reversedFiles = Object.entries(reversedFileMap);

  for (let [filePath, content] of reversedFiles) {
    const fullFilePath = path.join(outputDir, filePath);

    await smartWriteFile(fullFilePath, content);
  }
};

const getSourceMapFiles = async (dir) => {
  const dirFiles = await fs.readdir(dir);
  const sourcesMapFiles = dirFiles
    .filter((name) => MATCH_MAP_FILE.test(name))
    .map((name) => path.resolve(dir, name));
  return sourcesMapFiles;
};

const reverseSourceMaps = async (inputDir, outputDir) => {
  const sourceMapFiles = await getSourceMapFiles(inputDir);
  for (let sourceMapFile of sourceMapFiles) {
    await reverseSourceMap(sourceMapFile, outputDir);
  }
};

// reverseSourceMaps(
//   path.join(__dirname, "../dist"),
//   path.join(__dirname, "../source")
// );

module.exports = { reverseSourceMaps, reverseSourceMap };
