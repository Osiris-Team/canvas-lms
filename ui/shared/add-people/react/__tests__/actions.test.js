/*
 * Copyright (C) 2018 - present Instructure, Inc.
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

import axios from '@canvas/axios'
import {createStore} from '../store'
import {actions, actionTypes} from '../actions'
import INITIAL_STATE from '@canvas/add-people/initialState'
import sinon from 'sinon'

let sandbox = null
const restoreAxios = () => {
  if (sandbox) sandbox.restore()
  sandbox = null
}
const mockAxios = adapter => {
  restoreAxios()
  sandbox = sinon.createSandbox()
  sandbox.stub(axios, 'post').callsFake(adapter)
}
const mockAxiosSuccess = (data = {}) => {
  mockAxios(() =>
    Promise.resolve({
      data,
      status: 200,
      statusText: 'Ok',
      headers: {},
    }),
  )
}
const failureData = {
  message: 'Error',
  response: {
    data: 'Error',
    status: 400,
    statusText: 'Bad Request',
    headers: {},
  },
}
const mockAxiosFail = () => {
  mockAxios(() => Promise.reject(failureData))
}
let store = null
let storeSpy = null
let runningState = INITIAL_STATE
const mockStore = (state = runningState) => {
  storeSpy = sinon.spy()
  store = createStore((st, action) => {
    storeSpy(action)
    return st
  }, state)
}
const testConfig = () => ({
  beforeEach() {
    mockStore()
  },
  afterEach() {
    restoreAxios()
  },
})

describe('Add People Actions', () => {
  describe('validateUsers', () => {
    beforeEach(testConfig().beforeEach)
    afterEach(testConfig().afterEach)

    test('dispatches VALIDATE_USERS_START when called', () => {
      mockAxiosSuccess()
      store.dispatch(actions.validateUsers())
      expect(storeSpy.calledWith({type: actionTypes.VALIDATE_USERS_START})).toBe(true)
    })

    test('dispatches VALIDATE_USERS_SUCCESS with data when successful', async () => {
      const apiResponse = {
        users: [],
        duplicates: [],
        missing: [],
        errors: [],
      }
      mockAxiosSuccess(apiResponse)
      store.dispatch(actions.validateUsers())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith({
          type: actionTypes.VALIDATE_USERS_SUCCESS,
          payload: apiResponse,
        }),
      ).toBe(true)
    })

    test.skip('dispatches ENQUEUE_USERS_TO_BE_ENROLLED with data when validate users returns no dupes or missings', async () => {
      const apiResponse = {
        users: [
          {
            address: 'auser@example.com',
            user_id: 2,
            user_name: 'A User',
            account_id: 1,
            account_name: 'The Account',
            email: 'auser@example.com',
          },
        ],
        duplicates: [],
        missing: [],
        errors: [],
      }
      mockAxiosSuccess(apiResponse)
      store.dispatch(actions.validateUsers())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith(
          sinon.match({
            type: actionTypes.ENQUEUE_USERS_TO_BE_ENROLLED,
            payload: apiResponse.users,
          }),
        ),
      ).toBe(true)
    })

    test('dispatches VALIDATE_USERS_ERROR with error when fails', async () => {
      mockAxiosFail()
      store.dispatch(actions.validateUsers())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith({
          type: actionTypes.VALIDATE_USERS_ERROR,
          payload: failureData,
        }),
      ).toBe(true)
    })
  })

  describe('resolveValidationIssues', () => {
    beforeEach(testConfig().beforeEach)
    afterEach(testConfig().afterEach)

    test('dispatches CREATE_USERS_START when called', () => {
      mockAxiosSuccess()
      store.dispatch(actions.resolveValidationIssues())
      expect(storeSpy.calledWith({type: actionTypes.CREATE_USERS_START})).toBe(true)
    })

    test.skip('dispatches CREATE_USERS_SUCCESS with data when successful', async () => {
      const newUser = {
        name: 'foo',
        email: 'foo@bar.com',
      }
      runningState.userValidationResult.duplicates = {
        foo: {
          createNew: true,
          newUserInfo: newUser,
        },
      }
      const apiResponse = {
        invited_users: [newUser],
        errored_users: [],
      }
      mockAxiosSuccess(apiResponse)
      store.dispatch(actions.resolveValidationIssues())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith({
          type: actionTypes.CREATE_USERS_SUCCESS,
          payload: apiResponse,
        }),
      ).toBe(true)
      expect(
        storeSpy.calledWith({
          type: actionTypes.ENQUEUE_USERS_TO_BE_ENROLLED,
          payload: [newUser],
        }),
      ).toBe(true)
    })

    test.skip('dispatches CREATE_USERS_ERROR with error when fails', async () => {
      mockAxiosFail()
      store.dispatch(actions.resolveValidationIssues())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith({
          type: actionTypes.CREATE_USERS_ERROR,
          payload: failureData,
        }),
      ).toBe(true)
    })
  })

  describe('enrollUsers', () => {
    beforeEach(testConfig().beforeEach)
    afterEach(testConfig().afterEach)

    test('dispatches START when called', () => {
      mockAxiosSuccess()
      store.dispatch(actions.enrollUsers())
      expect(storeSpy.calledWith({type: actionTypes.ENROLL_USERS_START})).toBe(true)
    })

    test('dispatches SUCCESS with data when successful', async () => {
      mockAxiosSuccess({data: 'foo'})
      store.dispatch(actions.enrollUsers())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith({
          type: actionTypes.ENROLL_USERS_SUCCESS,
          payload: {data: 'foo'},
        }),
      ).toBe(true)
    })

    test('dispatches ERROR with error when fails', async () => {
      mockAxiosFail()
      store.dispatch(actions.enrollUsers())
      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1))
      expect(
        storeSpy.calledWith({
          type: actionTypes.ENROLL_USERS_ERROR,
          payload: failureData,
        }),
      ).toBe(true)
    })
  })

  describe('chooseDuplicate', () => {
    beforeEach(testConfig().beforeEach)
    afterEach(testConfig().afterEach)

    test('dispatches dependent actions', () => {
      runningState = INITIAL_STATE
      runningState.userValidationResult.duplicates = {
        foo: {
          selectedUserId: 1,
          newUserInfo: {
            email: 'foo',
            name: 'bar',
          },
        },
      }
      store.dispatch(
        actions.chooseDuplicate({
          address: 'foo',
          user_id: 1,
        }),
      )
      expect(
        storeSpy.calledWith({
          type: actionTypes.CHOOSE_DUPLICATE,
          payload: {
            address: 'foo',
            user_id: 1,
          },
        }),
      ).toBe(true)
    })
  })

  describe('skipDuplicate', () => {
    beforeEach(testConfig().beforeEach)
    afterEach(testConfig().afterEach)

    test('dispatches dependent actions', () => {
      store.dispatch(actions.skipDuplicate({address: 'foo'}))
      expect(
        storeSpy.calledWith({
          type: actionTypes.SKIP_DUPLICATE,
          payload: {address: 'foo'},
        }),
      ).toBe(true)
    })
  })

  describe('enqueue new ', () => {
    beforeEach(testConfig().beforeEach)
    afterEach(testConfig().afterEach)

    test('for duplicate dispatches dependent action', () => {
      const newUser = {
        name: 'Foo Bar',
        email: 'foo@bar.com',
      }
      store.dispatch(
        actions.enqueueNewForDuplicate({
          address: 'foo',
          newUserInfo: newUser,
        }),
      )
      expect(
        storeSpy.calledWith({
          type: actionTypes.ENQUEUE_NEW_FOR_DUPLICATE,
          payload: {
            address: 'foo',
            newUserInfo: newUser,
          },
        }),
      ).toBe(true)
    })

    test('for missing dispatches dependent action', () => {
      const newUser = {
        name: 'Foo Bar',
        email: 'foo@bar.com',
      }
      runningState.userValidationResult.missing = {foo: {newUserInfo: newUser}}
      store.dispatch(
        actions.enqueueNewForMissing({
          address: 'foo',
          newUser: newUser,
        }),
      )
      expect(
        storeSpy.calledWith({
          type: actionTypes.ENQUEUE_NEW_FOR_MISSING,
          payload: {
            address: 'foo',
            newUser: newUser,
          },
        }),
      ).toBe(true)
    })
  })
})
