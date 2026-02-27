import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;

let fontsCache = null;

async function fetchFontFromGoogle(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`;
  const css = await fetch(url, {
    headers: {
      // Older user-agent triggers TTF response instead of WOFF2
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((r) => r.text());

  const match = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );
  if (!match) {
    throw new Error(`Failed to extract font URL for weight ${weight}`);
  }
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

async function loadFonts() {
  if (fontsCache) return fontsCache;

  const [regular, bold] = await Promise.all([
    fetchFontFromGoogle(400),
    fetchFontFromGoogle(700),
  ]);

  fontsCache = [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
  ];
  return fontsCache;
}

function getTitleFontSize(title) {
  if (title.length > 80) return 36;
  if (title.length > 55) return 42;
  if (title.length > 35) return 48;
  return 54;
}

function divider() {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "100%",
        height: "1px",
        background: "#E4E4E7",
      },
      children: "",
    },
  };
}

function buildTemplate(title, category) {
  const footerChildren = [];
  if (category) {
    footerChildren.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          padding: "6px 16px",
          borderRadius: "4px",
          border: "1px solid #D4D4D8",
          fontSize: "16px",
          fontWeight: 500,
          color: "#52525B",
        },
        children: category,
      },
    });
  }
  footerChildren.push({
    type: "div",
    props: {
      style: {
        display: "flex",
        fontSize: "18px",
        color: "#A1A1AA",
        fontWeight: 400,
        marginLeft: "auto",
      },
      children: "blog.sahilbzy.com",
    },
  });

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
        background: "#FFFFFF",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "100%",
            height: "5px",
            background: "#27272A",
            },
            children: "",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "44px 70px 50px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#18181B",
                    letterSpacing: "3px",
                  },
                  children: "SAHIL BLOGS",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: "20px",
                    marginBottom: "24px",
                  },
                  children: [divider()],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: `${getTitleFontSize(title)}px`,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: "#18181B",
                          maxWidth: "1000px",
                        },
                        children: title,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: "24px",
                    marginBottom: "22px",
                  },
                  children: [divider()],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  },
                  children: footerChildren,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

export async function generateOgImage(title, category) {
  const fonts = await loadFonts();
  const template = buildTemplate(title, category);

  const svg = await satori(template, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const pngData = resvg.render().asPng();
  return Buffer.from(pngData);
}
