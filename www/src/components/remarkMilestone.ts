const pat = process.env.GITHUB_PAT;

const headers = { Authorization: `token ${pat}` };

import fetch from 'node-fetch';

const repo = `infinite-table/infinite-react`;

interface GithubIssue {
  title: string;
  state: 'open' | 'closed';
  labels: { name: string }[];
  html_url: string;
  type?: string;
}

const order = ['open', 'closed'];
const sortOpenFirst = (issue1: GithubIssue, issue2: GithubIssue) => {
  const state1 = issue1.state;
  const state2 = issue2.state;

  if (state1 === state2) {
    return 0;
  }
  return order.indexOf(state1) - order.indexOf(state2);
};

async function fetchAllMilestoneIssues(
  milestone: string | number,
  status = 'all',
  currentPage = 0,
) {
  const url = `https://api.github.com/repos/${repo}/issues?milestone=${milestone}&state=${status}&per_page=100`;

  const issues: GithubIssue[] = (
    await fetch(url, { headers })
  ).json() as unknown as GithubIssue[];

  if (issues.length) {
    issues.push(
      ...(await fetchAllMilestoneIssues(milestone, status, currentPage + 1)),
    );
  }

  return issues;
}

async function getMilestone(milestone: string | number, status = 'all') {
  const issues = await fetchAllMilestoneIssues(milestone, status);

  if (!Array.isArray(issues)) {
    console.warn(`Loading of issues for milestone ${milestone} has failed!`);
  }

  return {
    milestone: await (
      await fetch(
        `https://api.github.com/repos/${repo}/milestones/${milestone}`,
        {
          headers,
        },
      )
    ).json(),
    issues: !Array.isArray(issues)
      ? []
      : issues
          .map((issue) => {
            const typeLabel = issue.labels.find((label) =>
              label.name.startsWith('Type'),
            );
            const result: GithubIssue = {
              title: issue.title,
              state: issue.state,
              labels: issue.labels,
              html_url: issue.html_url,
              type: typeLabel
                ? typeLabel.name.slice('Type:'.length).trim()
                : issue.labels[0]
                ? issue.labels[0].name
                : '',
            };
            return result;
          })
          .sort(sortOpenFirst),
  };
}

import { visit } from 'unist-util-visit';

const remarkMilestonePlugin = function () {
  // @ts-ignore
  const unified = this as any;
  const tasks: [number, any, number | null, any][] = [];

  return async function transformer(tree: any) {
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
          .map((token: string) => token.split('='))
          .reduce((acc: Record<string, string>, [k, v]: [string, string]) => {
            acc[k] = v.slice(1, -1);
            return acc;
          }, {});

        const id = Number(parameters.id);

        tasks.push([id, node, index, parent]);
      }
    });

    await Promise.all(
      tasks.map(async ([id, index, parent]) => {
        const { issues } = await getMilestone(id);

        const content = [
          `<table>`,
          '<thead>',
          '<tr>',
          '<th>Type</th>',
          '<th width="100%" align="left">Description</th>',
          '</tr>',
          '</thead>',
          // '--- | ---',
          ...issues.map(
            (issue) =>
              `<tr><td>${issue.type}</td><td>${
                issue.state === 'closed' ? '✅  ' : '🔲  '
              }<a href="${
                issue.html_url
              }" className="ml-2" target="_blank" rel="noopener">${
                issue.title
              }</a></td></tr>`,
          ),
          '</table>',
        ].join('');
        const children = unified.parse(content).children;

        if (!parent) return;

        // @ts-ignore
        if (Array.isArray(parent.children)) {
          // @ts-ignore
          parent.children.splice(index, 1, ...children);
        }
      }),
    );
  };
};

export default remarkMilestonePlugin;
