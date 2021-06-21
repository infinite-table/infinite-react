import * as React from "react";

export default function Docs(props) {
  console.log("props", props);

  return <div> docs {props.version}</div>;
}

export async function getStaticProps(context) {
  console.log(context);
  return {
    props: {
      ...context.params,
    }, // will be passed to the page component as props
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { version: "1" } }, { params: { version: "2" } }],
    fallback: true,
  };
}
