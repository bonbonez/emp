class CatalogueController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @css_class_layout = 'bm-layout-page-catalogue'
    render layout: 'empty'
  end
end
