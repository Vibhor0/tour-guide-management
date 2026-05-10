import React from 'react'
import { NavLink } from 'react-router-dom'

function GuideNavbar() {
  return (
    <div>
        <title>Travel Tales</title>
        <nav>
            <ul>
                <li >
                    <NavLink to='/home'>Home</NavLink>
                </li>
                <li >
                    <NavLink>Place</NavLink>
                </li>
                <li>
                    <NavLink to='/newplace'>Add Place</NavLink>
                </li>
                <li>
                    <NavLink to='/viewplace'>View Place</NavLink>
                </li>
            </ul>
        </nav>
    </div>
  )
}

export default GuideNavbar