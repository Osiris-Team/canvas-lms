# frozen_string_literal: true

#
# Copyright (C) 2025 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

require "spec_helper"

describe DataFixup::DeleteOrphanedFeatureFlags do
  it "deletes orphaned User feature flags" do
    feature = Feature.definitions.values.find { |f| f.applies_to == "User" }.feature
    user = user_factory
    ff = user.feature_flags.create!(feature:, state: "on")
    FeatureFlag.where(id: ff).update_all(context_id: -1) # easier than hard-deleting and dealing with FK constraints
    described_class.run
    expect { ff.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it "deletes orphaned Course feature flags" do
    feature = Feature.definitions.values.find { |f| f.applies_to == "Course" }.feature
    course = course_factory
    ff = course.feature_flags.create!(feature:, state: "on")
    FeatureFlag.where(id: ff).update_all(context_id: -1)
    described_class.run
    expect { ff.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it "deletes orphaned Account feature flags" do
    feature = Feature.definitions.values.find { |f| f.applies_to == "Account" }.feature
    account = account_model(root_account: Account.default)
    ff = account.feature_flags.create!(feature:, state: "on")
    FeatureFlag.where(id: ff).update_all(context_id: -1)
    described_class.run
    expect { ff.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end
end
