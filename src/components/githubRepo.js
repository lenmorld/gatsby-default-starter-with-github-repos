import React from "react"

export default function GithubRepo({ repo }) {
	console.log(repo)

	return (
		<li>{repo.name}: {repo.description}</li>
	)
}