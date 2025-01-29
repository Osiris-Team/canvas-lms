/*
 * Copyright (C) 2024 - present Instructure, Inc.
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

// Generated by CodiumAI
import React from 'react'
import {render, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {GradingSchemeTable, type GradingSchemeTableProps} from '../GradingSchemeTable'
import {AccountGradingSchemeCards, DefaultGradingScheme, ExtraGradingSchemeCards} from './fixtures'

jest.mock('@canvas/do-fetch-api-effect')

describe('GradingSchemeTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const renderGradingSchemeTable = (props: Partial<GradingSchemeTableProps> = {}) => {
    const editGradingScheme = jest.fn()
    const openGradingScheme = jest.fn()
    const viewUsedLocations = jest.fn()
    const openDuplicateModal = jest.fn()
    const openDeleteModal = jest.fn()
    const archiveOrUnarchiveScheme = jest.fn()
    const funcs = render(
      <GradingSchemeTable
        caption="Grading Schemes"
        gradingSchemeCards={AccountGradingSchemeCards}
        showUsedLocations={true}
        editGradingScheme={editGradingScheme}
        openGradingScheme={openGradingScheme}
        viewUsedLocations={viewUsedLocations}
        openDuplicateModal={openDuplicateModal}
        openDeleteModal={openDeleteModal}
        archiveOrUnarchiveScheme={archiveOrUnarchiveScheme}
        defaultAccountGradingSchemeEnabled={false}
        {...props}
      />,
    )
    return {
      ...funcs,
      editGradingScheme,
      openGradingScheme,
      viewUsedLocations,
      openDuplicateModal,
      openDeleteModal,
      archiveOrUnarchiveScheme,
    }
  }
  it('should render a table with grading scheme cards sorted by name in ascending order by default', () => {
    // Arrange

    const {getByTestId} = renderGradingSchemeTable()
    // Assert
    expect(getByTestId('grading-scheme-row-1')).toBeInTheDocument()
    expect(getByTestId('grading-scheme-row-2')).toBeInTheDocument()
    expect(getByTestId('grading-scheme-row-3')).toBeInTheDocument()
  })

  it('should display pagination if there are more than 10 grading scheme cards', () => {
    const {getByTestId, queryByTestId} = renderGradingSchemeTable({
      gradingSchemeCards: ExtraGradingSchemeCards,
    })
    ExtraGradingSchemeCards.slice(0, 10).forEach(scheme => {
      expect(getByTestId(`grading-scheme-row-${scheme.gradingScheme.id}`)).toBeInTheDocument()
    })
    expect(queryByTestId('grading-scheme-row-9')).not.toBeInTheDocument()
    expect(getByTestId('grading-scheme-table-pagination')).toBeInTheDocument()
  })

  it('should display the next set of grading scheme cards when clicking on a pagination button', () => {
    const {getByTestId} = renderGradingSchemeTable({gradingSchemeCards: ExtraGradingSchemeCards})
    const paginationButton = getByTestId('scheme-table-page-1')
    paginationButton.click()
    ExtraGradingSchemeCards.slice(10, 20).forEach(scheme => {
      expect(getByTestId(`grading-scheme-row-${scheme.gradingScheme.id}`)).toBeInTheDocument()
    })
  })

  it('should sort the schemes in reverse order when clicking the button to reverse the sorting', () => {
    const {getByTestId, queryByTestId} = renderGradingSchemeTable({
      gradingSchemeCards: ExtraGradingSchemeCards,
    })
    expect(queryByTestId('grading-scheme-row-9')).not.toBeInTheDocument()
    const sortTableHeader = getByTestId('grading-scheme-name-header')
    const sortButton = within(sortTableHeader).getByRole('button')
    sortButton.click()
    expect(getByTestId('grading-scheme-row-9')).toBeInTheDocument()
  })

  it('should disable the delete button only when the grading scheme is in use', () => {
    const gradingSchemeCards = AccountGradingSchemeCards
    gradingSchemeCards[0].gradingScheme.assessed_assignment = true
    const {getByTestId} = renderGradingSchemeTable({gradingSchemeCards})
    const deleteButton = getByTestId('grading-scheme-1-delete-button')
    expect(deleteButton).toBeDisabled()
    const deleteButton2 = getByTestId('grading-scheme-2-delete-button')
    expect(deleteButton2).not.toBeDisabled()
  })

  it('should not show any buttons except duplicate for the default grading scheme', () => {
    const {getByTestId, queryByTestId} = renderGradingSchemeTable({
      gradingSchemeCards: [{editing: false, gradingScheme: DefaultGradingScheme}],
      showUsedLocations: false,
      defaultScheme: true,
    })
    expect(queryByTestId('grading-scheme--edit-button')).not.toBeInTheDocument()
    expect(queryByTestId('grading-scheme--delete-button')).not.toBeInTheDocument()
    expect(queryByTestId('grading-scheme--archive-button')).not.toBeInTheDocument()
    expect(getByTestId('grading-scheme--duplicate-button')).toBeInTheDocument()
  })

  it('should call the editGradingScheme function when the edit button is clicked', () => {
    const {getByTestId, editGradingScheme} = renderGradingSchemeTable()
    const editButton = getByTestId('grading-scheme-1-edit-button')
    editButton.click()
    expect(editGradingScheme).toHaveBeenCalledWith(AccountGradingSchemeCards[0].gradingScheme.id)
  })

  it('should call the openGradingScheme function when the grading scheme name is clicked', () => {
    const {getByTestId, openGradingScheme} = renderGradingSchemeTable()
    const name = getByTestId('grading-scheme-1-name')
    name.click()
    expect(openGradingScheme).toHaveBeenCalledWith(AccountGradingSchemeCards[0].gradingScheme)
  })

  it('should call the viewUsedLocations function when the locations used button is clicked', () => {
    const gradingSchemeCards = [AccountGradingSchemeCards[0]]
    gradingSchemeCards[0].gradingScheme.assessed_assignment = true
    const {getByTestId, viewUsedLocations} = renderGradingSchemeTable({gradingSchemeCards})
    const locationsButton = getByTestId('grading-scheme-1-view-locations-button')
    locationsButton.click()
    expect(viewUsedLocations).toHaveBeenCalledWith(AccountGradingSchemeCards[0].gradingScheme)
    gradingSchemeCards[0].gradingScheme.assessed_assignment = false
  })

  it('should call the openDuplicateModal function when the duplicate button is clicked', () => {
    const {getByTestId, openDuplicateModal} = renderGradingSchemeTable()
    const duplicateButton = getByTestId('grading-scheme-1-duplicate-button')
    duplicateButton.click()
    expect(openDuplicateModal).toHaveBeenCalledWith(AccountGradingSchemeCards[0].gradingScheme)
  })

  it('should call the openDeleteModal function when the delete button is clicked', () => {
    const {getByTestId, openDeleteModal} = renderGradingSchemeTable()
    const deleteButton = getByTestId('grading-scheme-1-delete-button')
    deleteButton.click()
    expect(openDeleteModal).toHaveBeenCalledWith(AccountGradingSchemeCards[0].gradingScheme)
  })

  it('should call the archiveOrUnarchiveScheme function when the archive button is clicked', () => {
    const {getByTestId, archiveOrUnarchiveScheme} = renderGradingSchemeTable()
    const archiveButton = getByTestId('grading-scheme-1-archive-button')
    archiveButton.click()
    expect(archiveOrUnarchiveScheme).toHaveBeenCalledWith(
      AccountGradingSchemeCards[0].gradingScheme,
    )
  })

  describe('defaultAccountGradingSchemeEnabled', () => {
    it('should disable the archive button if grading scheme is used as a default', () => {
      const {getByTestId} = renderGradingSchemeTable({defaultAccountGradingSchemeEnabled: true})
      const archiveButton = getByTestId('grading-scheme-3-archive-button')
      expect(archiveButton).toBeDisabled()
    })

    it('should disable the delete button if grading scheme is used as a default', () => {
      const {getByTestId} = renderGradingSchemeTable({defaultAccountGradingSchemeEnabled: true})
      const deleteButton = getByTestId('grading-scheme-3-delete-button')
      expect(deleteButton).toBeDisabled()
    })

    it('should display the tooltip over the archive button if disabled', async () => {
      const {getByText, getByTestId} = renderGradingSchemeTable({
        defaultAccountGradingSchemeEnabled: true,
      })
      const archiveButton = getByTestId('grading-scheme-3-archive-button')
      await userEvent.hover(archiveButton)
      expect(
        getByText(
          "You can't archive this grading scheme because it is set as a default for a course or account.",
        ),
      ).toBeInTheDocument()
    })

    it('should display the tooltip over the delete button if disabled', async () => {
      const {getByText, getByTestId} = renderGradingSchemeTable({
        defaultAccountGradingSchemeEnabled: true,
      })
      const deleteButton = getByTestId('grading-scheme-3-delete-button')
      await userEvent.hover(deleteButton)
      expect(
        getByText("You can't delete this grading scheme because it is in use."),
      ).toBeInTheDocument()
    })

    it('should display "Show Locations Used" as the Locations Used text', () => {
      const {getByTestId} = renderGradingSchemeTable({defaultAccountGradingSchemeEnabled: true})
      const locationsUsedLink = getByTestId('grading-scheme-3-view-locations-button')
      expect(locationsUsedLink.textContent).toEqual('Show locations used')
    })
  })
})
