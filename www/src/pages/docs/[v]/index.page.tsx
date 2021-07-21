export async function getStaticProps(context) {
  // console.log(context);
  return {
    props: {
      params: context.params,
    },
  };
}

// this is here just to limit the versions available
// and because nextjs needs it for server side generation

// TODO retrieve this list from somewhere real
export async function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          v: "v1",
        },
      },
      {
        params: {
          v: "v2",
        },
      },

      {
        params: {
          v: "v3",
        },
      },
    ],
    fallback: false,
  };
}

export default () => {
  return <div>Not found</div>;
};
