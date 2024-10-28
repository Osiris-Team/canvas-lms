# frozen_string_literal: true

#
# Copyright (C) 2024 - present Instructure, Inc.
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

module QuizVisibility
  class QuizVisibilityService
    extend VisibilityHelpers::Common
    class << self
      def visible_quiz_ids_in_course_by_user(user_ids:, course_ids:, use_global_id: false)
        raise ArgumentError, "course_ids cannot be nil" if course_ids.nil?
        raise ArgumentError, "course_ids must be an array" unless course_ids.is_a?(Array)
        raise ArgumentError, "user_ids cannot be nil" if user_ids.nil?
        raise ArgumentError, "user_ids must be an array" unless user_ids.is_a?(Array)

        vis_hash = {}
        quizzes_visible_to_students(user_id_params: user_ids, course_id_params: course_ids).each do |quiz_visible_to_student|
          user_id = quiz_visible_to_student.user_id
          user_id = Shard.global_id_for(user_id) if use_global_id
          vis_hash[user_id] ||= []
          vis_hash[user_id] << quiz_visible_to_student.quiz_id
        end
        # if users have no visibilities add their keys to the hash with an empty array
        vis_hash.reverse_merge!(user_ids.index_with { [] })
      end

      def quizzes_visible_to_student(course_id:, user_id:)
        raise ArgumentError, "course_id cannot be nil" if course_id.nil?
        raise ArgumentError, "course_id must not be an array" if course_id.is_a?(Array)
        raise ArgumentError, "user_id cannot be nil" if user_id.nil?
        raise ArgumentError, "user_id must not be an array" if user_id.is_a?(Array)

        quizzes_visible_to_students(course_id_params: course_id, user_id_params: user_id)
      end

      def quizzes_visible_to_students_in_courses(course_ids:, user_ids:)
        raise ArgumentError, "course_ids cannot be nil" if course_ids.nil?
        raise ArgumentError, "course_ids must be an array" unless course_ids.is_a?(Array)
        raise ArgumentError, "user_ids cannot be nil" if user_ids.nil?
        raise ArgumentError, "user_ids must be an array" unless user_ids.is_a?(Array)

        quizzes_visible_to_students(course_id_params: course_ids, user_id_params: user_ids)
      end

      def quiz_visible_to_student(quiz_id:, user_id:)
        raise ArgumentError, "quiz_id cannot be nil" if quiz_id.nil?
        raise ArgumentError, "quiz_id must not be an array" if quiz_id.is_a?(Array)
        raise ArgumentError, "user_id cannot be nil" if user_id.nil?
        raise ArgumentError, "user_id must not be an array" if user_id.is_a?(Array)

        quizzes_visible_to_students(quiz_id_params: quiz_id, user_id_params: user_id)
      end

      def quiz_visible_to_students(quiz_id:, user_ids:)
        raise ArgumentError, "quiz_id cannot be nil" if quiz_id.nil?
        raise ArgumentError, "quiz_id must not be an array" if quiz_id.is_a?(Array)
        raise ArgumentError, "user_ids cannot be nil" if user_ids.nil?
        raise ArgumentError, "user_ids must be an array" unless user_ids.is_a?(Array)

        quizzes_visible_to_students(quiz_id_params: quiz_id, user_id_params: user_ids)
      end

      def quiz_visible_in_course(quiz_id:, course_id:)
        raise ArgumentError, "course_id cannot be nil" if course_id.nil?
        raise ArgumentError, "course_id must not be an array" if course_id.is_a?(Array)
        raise ArgumentError, "quiz_id cannot be nil" if quiz_id.nil?
        raise ArgumentError, "quiz_id must not be an array" if quiz_id.is_a?(Array)

        quizzes_visible_to_students(course_id_params: course_id, quiz_id_params: quiz_id)
      end

      private

      def quizzes_visible_to_students(course_id_params: nil, user_id_params: nil, quiz_id_params: nil)
        if course_id_params.nil? && user_id_params.nil? && quiz_id_params.nil?
          raise ArgumentError, "at least one non nil course_id, user_id, or quiz_id_params is required (for query performance reasons)"
        end

        service_cache_fetch(service: name, course_id_params:, user_id_params:, additional_id_params: quiz_id_params) do
          QuizVisibility::Repositories::QuizVisibleToStudentRepository.visibility_query(
            course_id_params:, user_id_params:, quiz_id_params:
          )
        end
      end
    end
  end
end
