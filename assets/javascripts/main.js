function loadJSON(file, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', file);
  request.responseType = 'json';

  request.addEventListener('load', function() {
    callback(request.response);
  });

  request.send();
};

function scrollTo(height) {
  $("html, body").animate({ scrollTop: String(height) }, 500);
};


function generateSlug(string) {
  var result = string;
  result = result.replace(/[^a-zA-Z0-9]+/g, '-');
  result = result.toLowerCase();
  return result;
};

$(function() {

  var Skills = {
    $skillBox: $('#skillBox'),
    skillsData: [],
    $skills: null,
    $skillHeadings: $('[data-skill-heading]'),
    $skillSections: $('[data-skill]'),
    activeClassName: 'active',

    setSkills: function(response) {
      this.skillsData = response;
    },

    renderSkills: function() {
      this.$skillBox.html(App.templates.skills_template({ skills: this.skillsData }));
      this.$skills = $('.skill');
      this.$skillHeadings = $('[data-skill-heading]');
      this.$skillSections = $('[data-skill]');
    },

    eventsAfterSkillRender: function() {
      this.bindEvents();
      this.$skills.first().addClass(this.activeClassName);
      SkillToProjectLinks.init();
    },

    fetchAndRenderSkills: function() {
      loadJSON("assets/data/skills.json",  function(response) {
        this.setSkills(response);
        this.renderSkills();
        this.eventsAfterSkillRender();
      }.bind(this));
    },

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
      this.fetchAndRenderSkills();
    },
  };

  var SkillToProjectLinks = {
    $skillsLinks: null,
    $projectPageLink: $('nav a[data-title="projects"]'),

    navToProjectCard: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget);
      var id = $a.attr('data-id');
      var $card = Projects.$cards.filter('[data-id=' + id + ']');
      var $otherCards = Projects.$cards.not($card);

      Projects.clearFilters();
      this.$projectPageLink.eq(0).trigger('click');

      $otherCards.css({ opacity: 0 })
        .delay(1000)
        .animate({ opacity: 1 }, 5000);

      setTimeout(Projects.scrollToCard.bind(Projects, $card), 1100);
    },

    bindEvents: function() {
      $('.projects a').on('click', this.navToProjectCard.bind(this));
    },

    init: function() {
      // this.setSkillsLinks();
      this.bindEvents();
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
      var $checked = this.$checkboxes.filter(":checked");
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
      var id = Number($card.attr('data-id'));
      var cardData = this.getCardData(id);
      var keep = this.cardContainsAFilter(cardData, this.filters)
      $card.toggle(keep);
    },

    clearFilters: function() {
      this.$checkboxes.prop("checked", false).eq(0).trigger('change');
    },

    getCardData: function(id) {
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

    scrollToCard: function($card) {
      scrollTo($card.offset().top - 50);
    },

    bindEvents: function() {
      $('#project-filter :checkbox').on('change', this.filter.bind(this));
      $('#project-filter .checkbox').on('click', this.checkboxChange.bind(this));
    },

    renderFilters: function() {
      var filters = [];
      this.allFilters.forEach(function(filter) {
        filters.push({
          name: generateSlug(filter),
          value: filter,
          text: filter,
        });
      });

      $('#project-filter').html(App.templates.filters_template({ filters: filters }));
      this.$checkboxes = $("#project-filter :checkbox");
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

      scrollTo(0);
    },

    bindEvents: function() {
      $("body").on('click', "a[data-title]", this.getArticleContent.bind(this));
    },

    init: function() {
      this.cacheTemplates();
      this.registerPartials();
      this.removeHandlebarsScripts();
      this.bindEvents();
      Skills.init();
      Projects.init();
    },
  };

  App.init();

});
