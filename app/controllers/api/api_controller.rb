class Api::ApiController < ActionController::Base
  include ApplicationHelper
  include CartHelper

  #protect_from_forgery with: :exception

end
