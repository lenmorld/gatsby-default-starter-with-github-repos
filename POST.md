---
title: 📦 Adding Github repos to your Gatsby site using GraphQL
published: false
description: Connect to Mongo DB cloud with Node and Express in 10 minutes
tags: #node, #express, #database, #nosql
cover_image: 
---

Want to show off your Github repositories in your Gatsby site? 👨‍💼👩‍💼

Even if you don't know GraphQL, this guide shows you just enough GraphQL to get you started learning it and using it. 🤓

We'll use Github GraphQL API v4 to get all the repositories from your Github account 
and display it in your Gatsby site! 📊

Let's get into it! 🏃‍♀️🏃‍♂️

# GraphQL

## Intro to GraphQL
A GraphQL API allows us to more efficiently create and consume APIs.

For example, we might fetch something like this using REST:
- GET `/api/:name/projects`
- GET `/api/:name/projects/:project_id`
- GET `/api/:name/projects/:project_id/description`
- GET `/api/:name/projects/:project_id/name`
- GET `/api/:name/projects/:project_id/watchers`
- GET `/api/:name/projects/:project_id/watchers/:watcher_id`
- GET `/api/:name/projects/:project_id/watchers/:watcher_id/name`

In GraphQL, we don't have to "overfetch" and just get all data we need all at once from one endpoint:
```
query { 
  user(name: "myname") { 
    projects {
      name
      description
      watchers {
        name
      }
    }
  }
}
```

That's just the _tip of the iceberg_ for GraphQL. 🏔 ❄
For a more detailed guide to GraphQL:

{% link https://dev.to/davinc/graphql-for-beginners-3f1a %}

## Github GraphQL API

Github provides a GraphQL API in their v4 update.

They even provided a GraphiQL instance named "Gituhb GraphQL API explorer", which is basically an interactive "sandbox" for testing out queries on live Github data. 🧪

This is similar to the GraphiQL you can access locally on your Gatsby site, normally on `http://localhost:8000/___graphql`, but with the context of your Github account

## Github GraphQL API explorer

Go to [Github GraphQL API explorer](https://developer.github.com/v4/explorer/)

After you sign-in to github, you can now make queries!
Try this one...

```graphql
query { 
  viewer { 
    login
    name
    repositories(first: 10) {
      nodes {
        name
		  description
      }
    }
  }
}
```
...which gets the your Github `login`, `name`, and names of your first 10 repositories.
The `node` here represent each of the repositories found, which we can get the fields `name` and `description` from.

![Github GraphQL explorer](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462534/devto/gatsby_graphql_api/github_graphql_explorer.gif)

The nice thing with GraphiQL is that it gives you auto-complete. The docs on the upper-right corner are also super useful.

## Query to get all the repo details we need

```graphql
{
  viewer {
    login
    name
    repositories(first: 10) {
      nodes {
        id
        name
        description
        url
        updatedAt
        forkCount
        openGraphImageUrl
        stargazers {
          totalCount
        }
        readme: object(expression: "master:README.md") {
          ... on Blob {
            text
          }
        }
        licenseInfo {
          id
        }
        primaryLanguage {
          name
        }
        languages(first: 10) {
          nodes {
            name
          }
        }
      }
    }
  }
}
```
Which gives something like this
![Get repo details in Github GraphQL explorer](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462513/devto/gatsby_graphql_api/github_graphql_query_get_repo_details.png)

> See details here on how we got the README contents: [Github Community: GraphQL getting filename,file content and commit date](https://github.community/t/graphql-getting-filename-file-content-and-commit-date/13724/3)

> The `openGraphImageUrl` contains your repo's social media preview, which shows when you post your Github repo on Facebook, Twitter, blog, etc. It can be customized on the Repo settings. Max 1MB for the photo. ![Repo settings social preview](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462531/devto/gatsby_graphql_api/repo_settings_social_preview.png) Photo by [Christian Wiediger](https://unsplash.com/@christianw?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/computers?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText)

Cool! 😎

For details on using the explorer:
[Docs on Using Github GraphQL API explorer] (https://developer.github.com/v4/guides/using-the-explorer/)

> "We can get the data, but how can we get this into our web app?" 🤷‍♀️

# Github

## Generate a personal access token

A personal access token gives access to our app so it can make requests to our Github account:
- read repository details
- read user profile data
- create gists
- create and delete repositories
- read and write security keys
- etc

To get a personal access token, you'll have to go to Developer Settings and generate one with the access scopes your app needs.

You'll only need repo and user access for this exercise.

![Get personal access token from Github](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462532/devto/gatsby_graphql_api/github_get_personal_access_token.gif)

⚠ Copy-paste the personal access token somewhere since it will disappear next time you go to this page! 😱

# Gatsby - Node part

## You'll need a Gatsby site 😅

If you don't have one, you can use this [default starter](https://github.com/gatsbyjs/gatsby-starter-default)

```bash
$ gatsby new my-default-starter https://github.com/gatsbyjs/gatsby-starter-default
...
$ cd my-default-starter/
$ gatsby develop
```

> There's a lot more starters here to choose from. Take your pick at [Gatsby starters](https://www.gatsbyjs.org/starters)

## Put the query somewhere in the "Node" part of Gatsby

To keep organized, let's create a file `github-api.js` where we can put our GraphQL query from before.

```js
// github-api.js

exports.githubApiQuery = `
query($github_login: String!) {
	user(login: $github_login) {
      name
      repositories(first: 10) {
        nodes {
          ...
        }
      }
    }
  }
`
```

This is the query we used before to get repo details, but since we're not on our Github account's context anymore:
- `viewer` is not available
- Github login of account to be queried must be specified

### GraphQL variables

A GraphQL variable `$github_login` of type String:
- passed from the plugin config, and received by the query
- used to identify which Github `user` to get info from, by `login` name

> We're using Node syntax since this will be `require`d later in `gatsby-config.js`

## Put personal Access Token in .env 🔐

Putting plaintext API keys in our config code is not secure! 🕵️‍♂️ 

It's such a bad idea that Github revoked my Personal Access Token as soon as I tried pushing it to a public repo!

![Github email Personal Access Token found in commit](screens/github_email_personal_access_token_leaked.png)

Thanks for forcing me to follow secure practices Github! 🙏

Let's use `dotenv` library and put sensitive keys like this in a `.env` file

```bash
$ yarn add dotenv
```

**.env** file
```
GITHUB_LOGIN=your_github_login
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_personal_access_token
```

## Install and configure Gatsby Plugin for pulling data from Github GraphQL API

```bash
$ yarn add gatsby-source-github-api
```

## Configure plugin `gatsby-config.js` with the query
```js
// gatsby-config.js

// init. environment variables
const dotenv = require('dotenv');
dotenv.config();

const { githubApiQuery } = require('./github-api')

...
plugins: [
  ...
  {
    resolve: `gatsby-source-github-api`,
    options: {
      url: "https://api.github.com/graphql", // default Github GraphQL v4 API endpoint

      // token: required by the GitHub API
      token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,

      // GraphQLquery: defaults to a search query
      graphQLQuery: githubApiQuery,

      // variables: defaults to variables needed for a search query
      variables: {
        github_login: process.env.GITHUB_LOGIN
      }
    }
  }
  ...
```

- Import the query from the module we created before
- Configure the plugin so it can connect to Github GraphQL API successfully
  - ⚠ Don't forget to put your **Personal Access Token** here
- Get Github login from `env`, so the `$github_login` variable in the query can use it


## Start it up!

```bash
$ gatsby develop
```

Now that it's available from the backend, let's get this data from the UI side!

# Gatsby - React part

## Formulate frontend query

Fire up local GraphiQL [http://localhost:8000/___graphql](http://localhost:8000/___graphql) to see our Github data

![Local GraphiQL test query](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462539/devto/gatsby_graphql_api/local_graphiql_test_query.gif)

Soo nice to use GraphiQL! You can just click away to formulate your query!

Copy-paste the resulting query on the Query window so we can use this in our React component.

## Create a Page

Maybe you have a page already where you want to showcase your repos, like your **Projects** page.

```js
// pages/projects.js

import React from "react";

export default function Projects() {
  return (
    <div>
      Projects will go here
    </div>
  );
}
```

## `useStaticQuery` hook for querying GraphQL data

**Static Query** queries GraphQL at build time. 
- The nice thing is that it can appear anywhere in the component tree (vs page query that has to be top-level page component).
- The nicer thing with the hooks version `useStaticQuery` is that you don't need Render Props anymore to use it. 

Just run it and use the `data` result!

> 🔖 This only pulls it once during build, since it's a Static Query after all. Meaning, it won't get latest updates from the Github repo, until site is rebuilt.

```js
// pages/projects.js
...
import { useStaticQuery } from "gatsby"
...
export default function Projects() {
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
                    updatedAt
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
    <div>
      <h1>Projects</h1>
      <h2>Github Repos</h2>
      <ul>
        {
          repos.map(repo =>
            <li key={repo.id}>{repo.name}: {repo.description}</li>
          )
        }
      </ul>
    </div>
  );
```

![UI Github Repos Preview](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462520/devto/gatsby_graphql_api/ui_github_repos_preview.png)

![UI Github Repos Preview Console](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462519/devto/gatsby_graphql_api/ui_github_repos_preview_2.png)

Awesome! 🎉

_Our fictional has a few forked repos for demo 😅_

Now that we have all the data we need on the UI side, time to React! 🌀📏📐

# React component

Some highlights:
- scrollable README.md using `react-markdown`
- Social Media Preview image (`openGraphImageUrl`) on the right side
- liberal use of flexbox 😁

You can view the Projects view implementation here:
[Projects view](https://github.com/lenmorld/gatsby-default-starter-with-github-repos/blob/master/src/pages/index.js)

Voila! 💥

![Github repos in Gatsby](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462572/devto/gatsby_graphql_api/github_repos_in_gatsby.gif)


# BONUS: Deploy in Netlify

First, push the code to a Github Repo

From your Netlify dashboard, create new site and follow steps to create new site from Github repo

![Netlify config 1](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462518/devto/gatsby_graphql_api/netlify_config_1.png)

The nice thing is that you can specify the enviroment variable here before deploy!

> Remember that we can't commit `.env` to remote sincee that would expose our secrets to the cloud! 😱 So we have to configure the env. variable on our provider, in this case Netlify

![Netlify config 2](https://res.cloudinary.com/dvfhgkkpe/image/upload/v1595462518/devto/gatsby_graphql_api/netlify_config_2.png)

Deploy! 🚀

[Live demo](https://wizardly-yonath-ca537a.netlify.app/)

# Code

Full implementation here built on top of gatsby-default-starter.

[Full Code](https://github.com/lenmorld/gatsby-default-starter-with-github-repos)

Catch you in the next one!
