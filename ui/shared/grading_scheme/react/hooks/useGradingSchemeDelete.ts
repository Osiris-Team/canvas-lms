/*
 * Copyright (C) 2023 - present Instructure, Inc.
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

import {useState, useCallback} from 'react'

import doFetchApi from '@canvas/do-fetch-api-effect'
import {buildContextPath} from './buildContextPath'
import {ApiCallStatus} from './ApiCallStatus'

export const useGradingSchemeDelete = (): {
  deleteGradingScheme: (
    contextType: 'Account' | 'Course',
    contextId: string,
    gradingSchemeId: string,
  ) => Promise<void>
  deleteGradingSchemeStatus: string
} => {
  const [deleteGradingSchemeStatus, setDeleteGradingSchemeStatus] = useState(
    ApiCallStatus.NOT_STARTED,
  )

  const deleteGradingScheme = useCallback(
    async (
      contextType: 'Account' | 'Course',
      contextId: string,
      gradingSchemeId: string,
    ): Promise<void> => {
      setDeleteGradingSchemeStatus(ApiCallStatus.NOT_STARTED)
      try {
        const contextPath = buildContextPath(contextType, contextId)
        setDeleteGradingSchemeStatus(ApiCallStatus.PENDING)

        const result = await doFetchApi({
          path: `${contextPath}/grading_schemes/${gradingSchemeId}`,
          method: 'DELETE',
        })
        if (!result.response.ok) {
          throw new Error(result.response.statusText)
        }

        setDeleteGradingSchemeStatus(ApiCallStatus.COMPLETED)
      } catch (err) {
        setDeleteGradingSchemeStatus(ApiCallStatus.FAILED)
        throw err
      }
    },
    [],
  )

  return {
    deleteGradingScheme,
    deleteGradingSchemeStatus,
  }
}
