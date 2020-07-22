import React from "react";
import ReactMarkdown from 'react-markdown/with-html'

import { useStaticQuery } from "gatsby"

export default function IndexPage() {
  const data = useStaticQuery(
    graphql`
      query MyQuery {
        allGithubData {
          nodes {
            data {
              user {
                repositories {
                  nodes {
                    description
                    forkCount
                    id
                    name
                    openGraphImageUrl
                    updatedAt(fromNow: true)
                    url
                    primaryLanguage {
                      name
                    }
                    languages {
                      nodes {
                        name
                      }
                    }
                    readme {
                      text
                    }
                    stargazers {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
  )

  const repos = data.allGithubData.nodes[0].data.user.repositories.nodes

  console.log(repos)

  return (
    <div style={{ maxWidth: '80%', margin: 'auto', fontFamily: 'Arial' }}>
      <h1>Projects</h1>
      <h2>Github Repos</h2>
      <div >
      </div>
      <ul style={{ listStyle: 'none' }}>
        {
          repos.map(repo =>
            <li key={repo.id}>

              <div style={{ border: '1px solid gray', margin: '10px', padding: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <div style={{ flexBasis: '80%' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      <a href={repo.url} target="_blank" rel="noreferrer">
                        {repo.name}
                      </a>
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                      {repo.description}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', fontSize: '0.75rem' }}>
                      <span style={{ marginRight: '1rem' }}>{repo.forkCount} 🍴</span>
                      <span style={{ marginRight: '1rem' }}>{repo.stargazers.totalCount} ⭐</span>
                      <span style={{ marginRight: '1rem' }}>Updated {repo.updatedAt}</span>
                      <span>{repo.primaryLanguage.name}</span>
                    </div>
                  </div>
                  <div style={{ flexBasis: '20%' }}>
                    <img src={repo.openGraphImageUrl} width="100" />
                  </div>
                </div>


                {
                  repo.readme &&
                  <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px dashed gray', margin: '1rem', padding: '1rem' }}>
                    <ReactMarkdown source={repo.readme.text} escapeHtml={false} />
                    ...
                  </div>
                }
              </div>

            </li>
          )
        }
      </ul>
    </div >
  );
}
