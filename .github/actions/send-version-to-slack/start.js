const fs = require("fs");
const path = require("path");
const core = require("@actions/core");

async function run() {
  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../../source/dist/package.json"),
      "utf-8"
    )
  );
  try {
    const version = core.getInput("version") || packageJSON.version;

    const request = require("request");

    return new Promise((resolve, reject) => {
      request.post(
        core.getInput("slack_webhook_notify"),
        {
          json: {
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `InfiniteTable version *${
                    version || "uknown"
                  }* is out 🎉🎉🎉`,
                },
              },
            ],

            channel: "#builds",
            username: "Releasebot",
          },
        },
        (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            if (body === "ok") {
              core.info("Sent slack notification to #builds channel");
              resolve("done");
            } else {
              reject(body);
            }
          }
        }
      );
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
