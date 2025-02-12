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

import type {Product, Company, Lti, Badges, Tag} from '../../../models/Product'

const company: Company = {
  id: 2,
  name: 'Instructure',
  company_url: 'google.com',
}

const canvas_lti_configurations: Lti[] = [
  {
    id: 12,
    integration_type: 'lti_13_dynamic_registration',
    description: 'great product!',
    lti_placements: ['this is a piece of placement data'],
    lti_services: ['this is a piece of service data'],
    url: 'google.com',
    unified_tool_id: '1234',
  },
]

const badges: Badges[] = [{name: 'badge1', image_url: 'google.com', link: 'google.com'}]

const tags: Tag[] = [{id: '1', name: 'tag1'}]

const product: Product[] = [
  {
    id: '1',
    global_product_id: '1',
    name: 'Product 1',
    company,
    logo_url: 'google.com',
    tagline: 'Product 1 tagline',
    description: 'Product 1 description',
    updated_at: '2024-01-01',
    canvas_lti_configurations,
    integration_resources: {comments: null, resources: []},
    badges,
    screenshots: ['greatimage'],
    terms_of_service_url: 'google.com',
    privacy_policy_url: 'google.com',
    accessibility_url: 'google.com',
    support_url: 'google.com',
    tags,
  },
]

export {company, product, canvas_lti_configurations, badges, tags}
