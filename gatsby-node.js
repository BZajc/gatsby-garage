const path = require("path");
const { assignIds, assignGatsbyImage } = require("@webdeveducation/wp-block-tools");
const fs = require("fs")

exports.createPages = async ({ actions, graphql }) => {
  const pageTemplate = path.resolve("src/templates/page.js");
  const { createPage } = actions;

  const { data } = await graphql(`
    query AllPagesQuery {
      wp {
        themeStylesheet
      }
      allWpCar {
        nodes {
          blocks
          databaseId
          uri
        }
      }
      allWpPage {
        nodes {
          blocks
          databaseId
          uri
        }
      }
    }
  `);

  try{
    fs.writeFileSync("./public/themeStylesheet.css", data.wp.themeStylesheet)
  }catch(e){
    throw new Error(e)
  }

  const allPages = [...data.allWpPage.nodes, ...data.allWpCar.nodes]

  for (let i = 0; i < allPages.length; i++) {
    const page = allPages[i];
    let blocks = page.blocks;
    blocks = assignIds(blocks);
    blocks = await assignGatsbyImage({
      blocks,
      graphql,
      coreMediaText: true,
      coreImage: true,
      coreCover: true
    })

    createPage({
      path: page.uri,
      component: pageTemplate,
      context: {
        databaseId: page.databaseId,
        blocks,
      },
    });
  }
};
