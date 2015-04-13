(function ( window, document, BM, $, modules, radio ) {
  'use strict';

  var dynamicContentModule = function( provide, extend, PubSub ) {

    var DynamicContent = extend(PubSub),

      $class = DynamicContent,
      $super = $class.superclass,

      DynamicEffect = {
        FADE  : 1,
        SLIDE : 2
      };

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.apply(this, arguments);

        this._element          = null;

        if (!config) {
          return;
        }

        this.setElement(config.element);

        this._effect           = DynamicEffect.FADE;
        this._firstStep        = this._getStepInitial();

        this.setConfig(config);

        this._currentElement   = this._firstStep;
        this._stepsStack       = [];
        this._updateInProgress = false;

        //this._updateSize();
        //this.updateLayout();
      },

      setConfig : function(config) {
        if (!BM.tools.isUndefined(config)) {
          if (!BM.tools.isUndefined(config.element)) {
            this.setElement(config.element);
          }
          if (!BM.tools.isUndefined(config.effect)) {
            this.setDynamicEffect(config.effect);
          }
          if (!BM.tools.isUndefined(config.firstStep)) {
            this.setFirstStep(config.firstStep);
          }
        }
      },

      setElement : function(element) {
        if (!BM.tools.isUndefined(element)) {
          this._element = element;
        }
      },

      setDynamicEffect : function(effect) {
        if (!BM.tools.isUndefined(effect)) {
          this._effect = effect;
        }
      },

      setFirstStep : function(firstStep) {
        var step;
        if (!BM.tools.isUndefined(firstStep)) {
          step = this._getStep(firstStep);
          if (step.length > 0) {
            this._firstStep = step;
          }
        }
      },

      _updateSize : function(data) {return
        data = data || {};

        var me        = this,
          oldHeight      = data.oldHeight || this._currentElement.height(),
          newHeight      = data.newHeight || height,
          updateCallback = data.callback || function() {};

        /*if (!BM.tools.isUndefined(height) && BM.tools.isUndefined(callback)) {
         if (BM.tools.isNumber(height)) {
         newHeight = height;
         } else if (BM.tools.isFunction(height)) {
         updateCallback = height;
         }
         }*/

        if (BM.tools.isNull(newHeight)) {
          newHeight = this._currentElement.height();
        }

        this._element.css('height', this._element.height());
        this._element.get(0).offsetHeight;
        this._element.css('height', newHeight);

        setTimeout(function() {
          me._element.css('height', '');
          updateCallback();
        }, 350);
      },

      update : function() {
        //this._updateSize();
      },

      reset : function() {
        this.setStep(
          this._getStepFirst().attr('data-step')
        );
      },

      clearHeight : function() {
        this._element.css('height', '');
      },

      clearStepsStack : function() {
        this._stepsStack.length = 0;
        this._stepsStack = [];
      },

      /*showStepBackup : function(n, callback) {
       var me = this,
       nextStep    = n,
       currentStep = this._currentElement.attr('data-step');

       if (this._isCurrentStep(n) || !this._isStepExist(n)) {
       return;
       }

       this._stepsStack.push(currentStep);

       this._notify('fade-out-start', currentStep, nextStep);
       this._fadeOut(function(){
       var currentHeight = this._currentElement.height(),
       newHeight;

       me._notify('fade-out-end', currentStep, nextStep);

       me.setStep(n);
       newHeight = this._currentElement.height();

       me._notify('resize-start', currentStep, nextStep);

       me._resize(currentHeight, newHeight, function(){

       me._notify('resize-end', currentStep, nextStep);
       me._notify('fade-in-start', currentStep, nextStep);

       me._fadeIn(function(){
       me._notify('fade-in-end', currentStep, nextStep);
       if (BM.tools.isFunction(callback)) {
       callback();
       }
       });
       });
       });
       },*/

      showStep : function(stepNextName, callback, forceCallback, skipStack) {
        if (this._isCurrentStep(stepNextName) || !this._isStepExist(stepNextName) || this.isUpdateInProgress()) {
          if (forceCallback === true && BM.tools.isFunction(callback)) {
            callback();
          }
          return;
        }

        var me              = this,
          stepCurrent     = this._currentElement,
          stepCurrentName = stepCurrent.attr('data-step'),
          stepNext        = this._getStep(stepNextName),
          heightCurrent   = stepCurrent.height(),
          heightNext;

        this._updateInProgress = true;

        if (skipStack !== true) {
          this._stepsStack.push(stepCurrent.attr('data-step'));
        }

        this._notify('fade-out-start', stepCurrentName, stepNextName);
        this._fadeOut(function(){
          me._notify('fade-out-end', stepCurrentName, stepNextName);

          me._setHeightNoTransition(heightCurrent);
          me.setStep(stepNextName);
          heightNext = stepNext.height();

          me._notify('resize-start', stepCurrentName, stepNextName);
          me._element.css('height', heightNext);

          setTimeout(function() {
            me._notify('resize-end', stepCurrentName, stepNextName);
            me._notify('fade-in-start', stepCurrentName, stepNextName);

            me._fadeIn(function(){
              me._notify('fade-in-end', stepCurrentName, stepNextName);
              //me._element.css('height', '');
              me._setHeightNoTransition('');
              if (BM.tools.isFunction(callback)) {
                callback();
              }
              me._updateInProgress = false;
            });
          }, 350);
        });
      },

      showPreviousStep : function() {
        var step = this._stepsStack.pop();
        if (!BM.tools.isUndefined(step)) {
          this.showStep(step, function() {}, false, true);
        }
      },

      isStepsStackEmpty : function() {
        return this._stepsStack.length === 0;
      },

      setStep : function(n) {
        var stepToShow = this._getStep(n);
        if (stepToShow.length > 0) {
          this._element.find('> [data-step]').removeClass('visible');
          stepToShow.addClass('visible');
          this._currentElement = stepToShow;
        }
      },

      _getStep : function(n) {
        return this._element.find('> [data-step=' + n + ']');
      },

      _getStepInitial : function() {
        var result;
        result = this._element.find('.visible[data-step]');
        if (result.length > 0) {
          result = result.eq(0);
        } else {
          result = this._getStepFirst();
        }
        return result;
      },

      _getStepFirst : function() {
        return this._element.find('> [data-step]').eq(0);
      },

      _isStepExist : function(n) {
        return this._element.find('> [data-step=' + n + ']').length > 0;
      },

      isUpdateInProgress : function() {
        return this._updateInProgress;
      },

      _isCurrentStep : function(n) {
        return this._currentElement.attr('data-step') === n.toString();
      },

      showNext : function() {

      },

      showPrev : function() {

      },

      _fadeOut : function(callback) {
        this._unbindTransitionEnd();
        this._bindTransitionEnd(callback);
        this._element.attr('visible', 'false');
      },

      _fadeOut2 : function(callback) {
        this._unbindTransitionEnd();
        this._bindTransitionEnd(callback);
        this._element.attr('visible', 'false');
      },

      /*_resize : function(oldHeight, newHeight, callback) {
       this._updateSize(function(){
       if (typeof callback === 'function') {
       callback();
       }
       });
       },*/

      _fadeIn : function(callback) {
        this._unbindTransitionEnd();
        this._bindTransitionEnd(callback);
        this._element.removeAttr('visible');
      },

      _unbindTransitionEnd : function() {
        this._element.unbindTransitionEnd();
      },

      _bindTransitionEnd : function(callback) {
        callback = callback || function() {};
        this._element.transitionEnd(function() {
          this._unbindTransitionEnd();
          callback();
          this._notify('fade-in-end');
        }.bind(this));
      },

      collapse : function() {
        return this._fadeOut(function() {
          this._updateSize(0);
        }.bind(this));
      },

      getCurrentStepName : function() {
        return this._currentElement.attr('data-step');
      },

      _setHeightNoTransition : function(height) {
        this._element.attr('data-no-transition', 'true');
        this._triggerRender();
        this._element.css('height', height);
        this._triggerRender();
        this._element.removeAttr('data-no-transition');
      },

      _triggerRender : function() {
        this._element.get(0).offsetHeight;
      }

    });

    provide(DynamicContent);

  };

  modules.define( 'dynamicContent', ['extend', 'basePubSub'], dynamicContentModule );
}(
    this,
    this.document,
    this.BM,
    this.jQuery,
    this.modules,
    this.radio
  ));
