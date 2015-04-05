class IndexController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @css_class_layout = 'bm-layout-page-index'
    render layout: 'empty'
  end
end
