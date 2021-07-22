const path = require("path");

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

export async function getStaticPaths() {
  const { getVersionFolderNames } = require("@www/getVersionFolderNames");
  const versions = getVersionFolderNames("./pages/docs");

  console.log("versions", versions);
  return {
    paths: versions.map((v) => {
      return {
        params: {
          v,
        },
      };
    }),
    fallback: false,
  };
}

export default () => {
  return <div>Not found</div>;
};
