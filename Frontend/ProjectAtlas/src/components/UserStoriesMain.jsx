import React from 'react'
import NavbarDB from './NavbarDB'
import Jira2Code from './Jira2Code'
import JiraStories from './JiraStories'

const UserStoriesMain = () => {
  return (
    <div className='flex flex-col'>
        <NavbarDB title='Build User Stories' byline='Use standard documents to build user stories and push to JIRA'/>
        <JiraStories />
    </div>
  )
}

export default UserStoriesMain