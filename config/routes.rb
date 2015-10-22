Empressa::Application.routes.draw do

  namespace :admin do
    root to: 'index#index'
    get 'letmeinpleaseimacat', to: 'index#enable_admin_access'
    get 'letmeinpleaseimadog', to: 'index#disable_admin_access'

    resources :countries
    resources :items
  end

  namespace :api, path: 'api' do
    get 'translations/get', to: 'translations#get'
  end

  get "/" => "index#index"
  get "/catalogue" => "catalogue#index"
end
