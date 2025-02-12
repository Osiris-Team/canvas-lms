/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {render, screen} from '@testing-library/react'
import {merge} from 'lodash'
import React from 'react'
import {DiscussionRow} from '../DiscussionRow'

jest.mock('@canvas/util/globalUtils', () => ({
  assignLocation: jest.fn(),
}))

// We can't call the wrapped component because a lot of these tests are depending
// on the class component instances. So we've got to cobble up enough of the date
// formatter to send in as a prop.
const dateFormatter = date => {
  const fmtr = Intl.DateTimeFormat('en').format
  try {
    if (date === null) return ''
    return fmtr(date instanceof Date ? date : new Date(date))
  } catch (e) {
    if (e instanceof RangeError) return ''
    throw e
  }
}

describe('DiscussionRow', () => {
  const makeProps = (props = {}) =>
    merge(
      {
        discussion: {
          id: '1',
          position: 1,
          published: true,
          title: 'Hello World',
          message: 'Foo bar bar baz boop beep bop Foo',
          posted_at: 'January 10, 2019 at 10:00 AM',
          can_unpublish: true,
          author: {
            id: '5',
            name: 'John Smith',
            display_name: 'John Smith',
            html_url: '',
            avatar_image_url: null,
          },
          permissions: {},
          subscribed: false,
          read_state: 'unread',
          unread_count: 0,
          discussion_subentry_count: 5,
          locked: false,
          html_url: '',
          user_count: 10,
          last_reply_at: new Date(2018, 1, 14, 0, 0, 0, 0),
          ungraded_discussion_overrides: [],
        },
        canPublish: false,
        canReadAsAdmin: true,
        displayDeleteMenuItem: false,
        displayDuplicateMenuItem: false,
        displayLockMenuItem: false,
        displayManageMenu: false,
        displayPinMenuItem: false,
        displayDifferentiatedModulesTray: false,
        isMasterCourse: false,
        toggleSubscriptionState: () => {},
        cleanDiscussionFocus: () => {},
        duplicateDiscussion: () => {},
        updateDiscussion: () => {},
        masterCourseData: {},
        setCopyTo: () => {},
        setSendTo: () => {},
        setSendToOpen: () => {},
        deleteDiscussion: () => {},
        DIRECT_SHARE_ENABLED: false,
        contextType: '',
        dateFormatter,
        breakpoints: {mobileOnly: false},
      },
      props,
    )

  const oldEnv = window.ENV

  afterEach(() => {
    window.ENV = oldEnv
  })

  it('does not render UnreadBadge if discussion has replies == 0', () => {
    const discussion = {discussion_subentry_count: 0}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.queryByText('0 unread replies')).not.toBeInTheDocument()
  })

  it('renders ReadBadge if discussion is unread', () => {
    const discussion = {read_state: 'unread'}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getByTestId('ic-blue-unread-badge')).toBeInTheDocument()
  })

  it('does not render ReadBadge if discussion is read', () => {
    const discussion = {read_state: 'read'}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.queryByTestId('ic-blue-unread-badge')).not.toBeInTheDocument()
  })

  it('renders the subscription ToggleIcon', () => {
    render(<DiscussionRow {...makeProps()} />)
    expect(screen.getByText('Subscribe to Hello World')).toBeInTheDocument()
  })

  it('disables publish button when can_unpublish is false', () => {
    const discussion = {can_unpublish: false}
    render(<DiscussionRow {...makeProps({canPublish: true, discussion})} />)
    const button = screen.getByRole('button', {name: 'Unpublish Hello World'})
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('allows to publish even if you cannot unpublish', () => {
    const discussion = {can_unpublish: false, published: false}
    render(<DiscussionRow {...makeProps({canPublish: true, discussion})} />)
    const button = screen.getByRole('button', {name: 'Publish Hello World'})
    expect(button.hasAttribute('disabled')).toBe(false)
  })

  it('renders the publish ToggleIcon', () => {
    const discussion = {published: false}
    render(<DiscussionRow {...makeProps({canPublish: true, discussion})} />)
    expect(screen.getAllByText('Publish Hello World', {exact: false})).toHaveLength(2)
  })

  it('when feature flag is off, renders anonymous discussion lock explanation for read_as_admin', () => {
    window.ENV.discussion_anonymity_enabled = false
    const discussion = {locked: false, title: 'blerp', anonymous_state: 'full_anonymity'}
    render(<DiscussionRow {...makeProps({canReadAsAdmin: true, discussion})} />)
    expect(screen.getByText('Discussions/Announcements Redesign')).toBeInTheDocument()
  })

  it('when feature flag is off, renders anonymous discussion unavailable for students, etc.', () => {
    window.ENV.discussion_anonymity_enabled = false
    const discussion = {locked: false, title: 'blerp', anonymous_state: 'full_anonymity'}
    render(<DiscussionRow {...makeProps({canReadAsAdmin: false, discussion})} />)
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('when feature flag is off, renders partially anonymous discussion unavailable for students, etc.', () => {
    window.ENV.discussion_anonymity_enabled = false
    const discussion = {locked: false, title: 'blerp', anonymous_state: 'partial_anonymity'}
    render(<DiscussionRow {...makeProps({canReadAsAdmin: false, discussion})} />)
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('renders "Delayed until" date label if discussion is delayed', () => {
    const delayedDate = new Date()
    delayedDate.setYear(delayedDate.getFullYear() + 1)
    const discussion = {delayed_post_at: delayedDate}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getAllByText(`Not available until ${dateFormatter(delayedDate)}`)).toBeTruthy()
  })

  it('renders "Delayed until" date label for ungraded overrides', () => {
    const futureDate = new Date('2027-01-17T00:00:00Z')
    const furtherFutureDate = new Date('2028-01-17T00:00:00Z')
    const discussion = {
      ungraded_discussion_overrides: [{assignment_override: {unlock_at: futureDate}}],
    }
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getAllByText(`Not available until ${dateFormatter(futureDate)}`)).toBeTruthy()
  })

  it('renders "Delayed until" date label for ungraded overrides even if has discussion has "everyone" dates', () => {
    const futureDate = new Date('2027-01-17T00:00:00Z')
    const furtherFutureDate = new Date('2028-01-17T00:00:00Z')
    const discussion = {
      delayed_post_at: futureDate,
      ungraded_discussion_overrides: [{assignment_override: {unlock_at: furtherFutureDate}}],
    }
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(
      screen.getAllByText(`Not available until ${dateFormatter(furtherFutureDate)}`),
    ).toBeTruthy()
  })

  it('renders the further "Delayed until" date for ungraded overrides', () => {
    const futureDate = new Date('2027-01-17T00:00:00Z')
    const furtherFutureDate = new Date('2028-01-17T00:00:00Z')
    const discussion = {
      ungraded_discussion_overrides: [
        {assignment_override: {unlock_at: futureDate}},
        {assignment_override: {unlock_at: furtherFutureDate}},
      ],
    }
    render(<DiscussionRow {...makeProps({discussion})} />)

    // Find all elements that contain text starting with "Not available until"
    const availabilityElements = screen.getAllByText(/^Not available until/)
    expect(availabilityElements.length).toBeGreaterThan(0)

    // Get all text content that includes "Not available until"
    const availabilityTexts = availabilityElements.map(el => el.textContent)

    // Verify at least one of them has the later date
    const hasLaterDate = availabilityTexts.some(text => {
      const formattedDate = dateFormatter(furtherFutureDate)
      return text.includes(formattedDate)
    })
    expect(hasLaterDate).toBe(true)
  })

  it('renders a last reply at date', () => {
    render(<DiscussionRow {...makeProps()} />)
    expect(screen.getAllByText('Last post at 2/14', {exact: false})).toHaveLength(2)
  })

  it('does not render last reply at date if there is none', () => {
    const discussion = {last_reply_at: ''}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.queryByText('Last post at', {exact: false})).not.toBeInTheDocument()
  })

  it('renders available until if appropriate', () => {
    const futureDate = new Date()
    futureDate.setYear(futureDate.getFullYear() + 1)
    const discussion = {lock_at: futureDate}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getAllByText('Available until', {exact: false})).toHaveLength(2)
    // We need a relative date to ensure future-ness, so we can't really insist
    // on a given date element appearing this time
  })

  it('renders available until for ungraded overrides', () => {
    const futureDate = new Date('2027-01-17T00:00:00Z')
    const furtherFutureDate = new Date('2028-01-17T00:00:00Z')
    const discussion = {
      ungraded_discussion_overrides: [{assignment_override: {lock_at: futureDate}}],
    }
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getAllByText(`Available until ${dateFormatter(futureDate)}`)).toBeTruthy()
  })

  it('renders available until for ungraded overrides even if has discussion has "everyone" dates', () => {
    const futureDate = new Date('2027-01-17T00:00:00Z')
    const furtherFutureDate = new Date('2028-01-17T00:00:00Z')
    const discussion = {
      lock_at: futureDate,
      ungraded_discussion_overrides: [{assignment_override: {lock_at: furtherFutureDate}}],
    }
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getAllByText(`Available until ${dateFormatter(furtherFutureDate)}`)).toBeTruthy()
  })

  it('renders the further available until date for ungraded overrides', () => {
    const futureDate = new Date('2027-01-17T00:00:00Z')
    const furtherFutureDate = new Date('2028-01-17T00:00:00Z')
    const discussion = {
      ungraded_discussion_overrides: [
        {assignment_override: {lock_at: futureDate}},
        {assignment_override: {lock_at: furtherFutureDate}},
      ],
    }
    render(<DiscussionRow {...makeProps({discussion})} />)

    // Find all elements that contain text starting with "Available until"
    const availabilityElements = screen.getAllByText(/^Available until/)
    expect(availabilityElements.length).toBeGreaterThan(0)

    // Get all text content that includes "Available until"
    const availabilityTexts = availabilityElements.map(el => el.textContent)

    // Verify at least one of them has the later date
    const hasLaterDate = availabilityTexts.some(text => {
      const formattedDate = dateFormatter(furtherFutureDate)
      return text.includes(formattedDate)
    })
    expect(hasLaterDate).toBe(true)
  })

  it('renders locked at if appropriate', () => {
    const pastDate = new Date()
    pastDate.setYear(pastDate.getFullYear() - 1)
    const discussion = {lock_at: pastDate}
    render(<DiscussionRow {...makeProps({discussion})} />)
    expect(screen.getAllByText('No longer available', {exact: false})).toHaveLength(2)
    // We need a relative date to ensure past-ness, so we can't really insist
    // on a given date element appearing this time
  })
})
