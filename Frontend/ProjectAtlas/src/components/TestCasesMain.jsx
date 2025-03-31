import React from 'react'
import NavbarDB from './NavbarDB'
import Jira2Code from './Jira2Code'

const TestCasesMain = () => {
  return (
    <div className='flex flex-col'>
        <NavbarDB title='Add test cases' byline='Use boilerplate code and test cases to get started!' />

        <Jira2Code />

    </div>
  )
}

export default TestCasesMain