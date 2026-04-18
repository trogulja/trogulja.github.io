import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontBold = readFileSync(
  resolve('src/assets/fonts/JetBrainsMono-Bold.ttf')
);
const fontRegular = readFileSync(
  resolve('src/assets/fonts/JetBrainsMono-Regular.ttf')
);

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, description: post.data.description },
  }));
};

const dot = (color: string) => ({
  type: 'div' as const,
  props: {
    style: {
      width: 14,
      height: 14,
      borderRadius: 7,
      background: color,
    },
  },
});

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          fontFamily: 'JetBrains Mono',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
        },
        children: [
          // Terminal window
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                border: '1px solid #333',
                borderRadius: 10,
                overflow: 'hidden',
              },
              children: [
                // Title bar
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '14px 20px',
                      background: '#1a1a1a',
                      borderBottom: '1px solid #333',
                    },
                    children: [
                      dot('#ff5f57'),
                      dot('#febc2e'),
                      dot('#28c840'),
                      {
                        type: 'span',
                        props: {
                          style: {
                            color: '#666',
                            fontSize: 13,
                            marginLeft: 12,
                          },
                          children: 'trogulja.github.io/blog',
                        },
                      },
                    ],
                  },
                },
                // Terminal body
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      padding: '40px 50px',
                    },
                    children: [
                      // Content
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column' },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  color: '#666',
                                  fontSize: 16,
                                  marginBottom: 8,
                                },
                                children: '> cat blog.md',
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  color: '#00ff41',
                                  fontSize: 48,
                                  fontWeight: 700,
                                  lineHeight: 1.2,
                                  marginTop: 8,
                                },
                                children: title,
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  color: '#999',
                                  fontSize: 20,
                                  lineHeight: 1.5,
                                  marginTop: 16,
                                },
                                children: description,
                              },
                            },
                          ],
                        },
                      },
                      // Footer inside terminal
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #222',
                            paddingTop: 16,
                          },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: { color: '#555', fontSize: 16 },
                                children: 'Tibor Rogulja',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: { color: '#00ff41', fontSize: 14 },
                                children: '> _',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'JetBrains Mono', data: fontBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: fontRegular, weight: 400, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
