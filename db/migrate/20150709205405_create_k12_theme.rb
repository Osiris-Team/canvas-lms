# frozen_string_literal: true

#
# Copyright (C) 2015 - present Instructure, Inc.
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

class CreateK12Theme < ActiveRecord::Migration[4.2]
  tag :predeploy

  NAME = "K12 Theme"

  def up
    variables = {
      "ic-brand-primary" => "#E66135",
      "ic-brand-button--primary-bgd" => "#0180ff",
      "ic-link-color" => "#0180ff",
      "ic-brand-global-nav-bgd" => "#0180ff",
      "ic-brand-global-nav-logo-bgd" => "##0180ff"
    }
    bc = BrandConfig.new(variables:)
    bc.name = NAME
    bc.share = true
    bc.save!
    SharedBrandConfig.create!(name: bc.name, brand_config_md5: bc.md5)
  end

  def down
    SharedBrandConfig.where(name: NAME).delete_all
    BrandConfig.where(name: NAME).delete_all
  end
end
