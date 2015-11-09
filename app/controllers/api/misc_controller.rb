class Api::MiscController < Api::ApiController
  def get_brewing_methods
    render json: brewing_methods(with_beans: true).to_json
  end

  def get_grind_types
    render json: grind_types.to_json
  end
end