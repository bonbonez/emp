class CatalogueController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @css_class_layout = 'bm-layout-page-catalogue'
    @scripts_id       = 'catalogue-index'
    render layout: 'empty'
  end
end
