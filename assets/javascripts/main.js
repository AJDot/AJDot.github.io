function loadJSON(file, callback) {
  var request = new XMLHttpRequest();
  var url = "assets/data/cards.json";
  request.open('GET', url);
  request.responseType = 'json';

  request.addEventListener('load', function() {
    callback(request.response);
  });

  request.send();
};

$(function() {

  var Experience = {
    $skills: $('.skill'),
    $skillHeadings: $('[data-skill-heading]'),
    $skillSections: $('[data-skill]'),
    activeClassName: 'active',


    revealSkill: function(e) {
      e.preventDefault();
      var $skill = $(e.currentTarget).closest('.skill');
      var className = 'active';
      $skill.addClass(this.activeClassName);
      this.$skills.not($skill).removeClass(this.activeClassName);

      var skill = $(e.currentTarget).attr('data-skill-heading');
      var $current= this.$skillSections.filter('[data-skill="' + skill + '"]');
      var $others = this.$skillSections.not($current);
      $current.slideDown();
      $others.slideUp();
    },

    bindEvents: function() {
      this.$skillHeadings.on('click', this.revealSkill.bind(this));
    },

    init: function() {
      this.bindEvents();
      this.$skills.first().addClass(this.activeClassName)
    },
  };

  var Projects = {
    $cardBox: $('#cardBox'),
    $cards: null,
    cardData: [],
    filters: [],
    allFilters: [],

    setCards: function(response) {
      this.cardData = response;
    },

    setAllFilters: function() {
      this.cardData.forEach(function(card) {
        card.filters.forEach(function(filter) {
          if (this.allFilters.indexOf(filter) === -1) {
            this.allFilters.push(filter);
          }
        }.bind(this));
      }.bind(this));
    },

    setFilters: function() {
      var $checkboxes = $("#project-filter :checkbox");
      var $checked = $checkboxes.filter(":checked");
      var filters = $checked.map(function() {
        return $(this).val();
      }).get();
      return filters;
    },

    filter: function(e) {
      this.filters = this.setFilters();

      if (this.filters.length === 0) {
        this.$cards.toggle(true);
      } else {
        this.$cards.each(this.filterCard.bind(this));
      }
    },

    filterCard: function(index, card) {
      var $card = $(card);
      var cardData = this.getCardData($card);
      var keep = this.cardContainsAFilter(cardData, this.filters)
      $card.toggle(keep);
    },

    getCardData: function($card) {
      var id = Number($card.attr('data-id'));
      return this.cardData.find(function(card) {
        return card.id === id;
      });
    },

    cardContainsAFilter: function(cardData, filters) {
      return filters.some(function(filter) {
        return cardData.filters.indexOf(filter) !== -1;
      });
    },

    checkboxChange: function(e) {
      var $checkbox = $(e.currentTarget);
      var name = $checkbox.attr("data-name");
      var $input = $('input[name=' + name + ']');
      var checked = $input.prop("checked");

      $input.prop("checked", !checked);
      $input.trigger("change");
    },

    bindEvents: function() {
      $('#project-filter :checkbox').on('change', this.filter.bind(this));
      $('#project-filter .checkbox').on('click', this.checkboxChange.bind(this));
    },

    renderFilters: function() {
      var filters = [];
      this.allFilters.forEach(function(filter) {
        var obj = {};
        obj.name = filter.replace(/[^a-zA-Z0-9]+/g, '-');
        obj.name = obj.name.toLowerCase();

        obj.value = filter;
        obj.text = filter;
        filters.push(obj);
      });

      $('#project-filter').html(App.templates.filters_template({ filters: filters }));
    },

    renderCards: function() {
      this.$cardBox.html(App.templates.cards_template({ cards: this.cardData }));
      this.$cards = $('.card-container');
    },

    fetchAndRenderCards: function() {
      loadJSON("assets/data/cards.json",  function(response) {
        this.setCards(response);
        this.renderCards();
        this.eventsAfterCardRender();
      }.bind(this));
    },

    eventsAfterCardRender: function() {
      this.setAllFilters();
      this.renderFilters();
      this.bindEvents();
    },

    init: function() {
      this.fetchAndRenderCards();
    },
  }

  var App = {
    templates: {},
    $articles: $('.content article'),


    cacheTemplates: function() {
      var self = this;
      $('script[type="text/x-handlebars"]').each(function() {
        var $tmpl = $(this);
        self.templates[$tmpl.attr('id')] = Handlebars.compile($tmpl.html());
      });
    },

    registerPartials: function() {
      $('script[data-type="partial"]').each(function() {
        var $partial = $(this);
        Handlebars.registerPartial($partial.attr('id'), $partial.html());
      });
    },

    removeHandlebarsScripts: function() {
      $('script[type="text/x-handlebars"]').remove();
    },

    getArticleContent: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget);
      var title = $a.attr('data-title');

      this.$articles.fadeOut(400).filter('[data-title=' + title + ']').delay(400).fadeIn(400);

      this.scrollToTop();
    },

    scrollToTop: function() {
      $("html, body").animate({ scrollTop: "0" }, 500);
    },

    bindEvents: function() {
      $("a[data-title]").on('click', this.getArticleContent.bind(this));
    },

    init: function() {
      this.cacheTemplates();
      this.registerPartials();
      this.removeHandlebarsScripts();
      this.bindEvents();
      Experience.init();
      Projects.init();
    },
  };

  App.init();

});
