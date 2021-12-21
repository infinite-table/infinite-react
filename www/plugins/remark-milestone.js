const pat = process.env.GITHUB_PAT;
const headers = { Authorization: `token ${pat}` };

const repo = `infinite-table/infinite-react`;

const order = ['open', 'closed'];
const sortOpenFirst = (issue1, issue2) => {
  const state1 = issue1.state;
  const state2 = issue2.state;

  if (state1 === state2) {
    return 0;
  }
  return order.indexOf(state1) - order.indexOf(state2);
};

async function fetchAllMilestoneIssues(
  milestone,
  status = 'all',
  currentPage = 0
) {
  const url = `https://api.github.com/repos/${repo}/issues?milestone=${milestone}&state=${status}&per_page=100`;

  const issues = (await fetch(url, { headers })).json();

  if (issues.length) {
    issues.push(
      ...(await fetchAllMilestoneIssues(
        milestone,
        status,
        currentPage + 1
      ))
    );
  }

  return issues;
}

async function getMilestone(milestone, status = 'all') {
  const url = `https://api.github.com/repos/${repo}/issues?milestone=${milestone}&state=${status}`;

  const issues = await fetchAllMilestoneIssues(
    milestone,
    status
  );

  return {
    milestone: await (
      await fetch(
        `https://api.github.com/repos/${repo}/milestones/${milestone}`,
        {
          headers,
        }
      )
    ).json(),
    issues: issues
      .map((issue) => {
        const typeLabel = issue.labels.find((label) =>
          label.name.startsWith('Type')
        );
        return {
          title: issue.title,
          state: issue.state,
          type: typeLabel
            ? typeLabel.name.slice('Type:'.length).trim()
            : issue.labels[0]
            ? issue.labels[0].name
            : '',
          url: issue.html_url,
        };
      })
      .sort(sortOpenFirst),
  };
}

const visit = require('unist-util-visit');

const remarkMilestonePlugin = function () {
  const unified = this;
  const tasks = [];

  return async function transformer(tree, file) {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (
        node.children &&
        node.children[0] &&
        node.children[0].type === 'text'
      ) {
        const value = node.children[0].value;

        if (!value.startsWith('@milestone')) return;

        const parameters = value
          .split(/\s+(?=\w+=)/)
          .slice(1)
          .map((token) => token.split('='))
          .reduce((acc, [k, v]) => {
            acc[k] = v.slice(1, -1);
            return acc;
          }, {});

        const id = Number(parameters.id);

        tasks.push([id, node, index, parent]);
      }
    });

    await Promise.all(
      tasks.map(async ([id, node, index, parent]) => {
        const { issues, milestone } = await getMilestone(
          id
        );

        const content = [
          `<table>`,
          '<thead>',
          '<th>Type</th>',
          '<th width="100%" align="left">Description</th>',
          '</thead>',
          // '--- | ---',
          ...issues.map(
            (issue) => `<tr><td>${issue.type}</td><td>
              ${
                issue.state === 'closed' ? '✅  ' : '🔲  '
              } <a href="${
              issue.url
            }" className="ml-2" target="_blank" rel="noopener">${
              issue.title
            }</a></td></tr>`
          ),
          '</table>',
        ].join('\n');
        const children = unified.parse(content).children;
        parent.children.splice(index, 1, ...children);
      })
    );
  };
};

module.exports = remarkMilestonePlugin;
