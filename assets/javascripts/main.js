function loadJSON(file, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', file);
  request.responseType = 'json';

  request.addEventListener('load', function() {
    callback(request.response);
  });

  request.send();
};

function scrollTo(height, duration) {
  $("html, body").animate({ scrollTop: String(height) }, duration);
};


function generateSlug(string) {
  var result = string;
  result = result.replace(/[^a-zA-Z0-9]+/g, '-');
  result = result.toLowerCase();
  return result;
};

$(function() {

  var Biography = {
    $bioBox: $('#bioBox'),
    $sections: null,
    bioData: [],
    activeClassName: "active",

    setBioData: function(response) {
      this.bioData = response;
    },

    renderBio: function() {
      this.$bioBox.html(App.templates.bio_template({ sections: this.bioData }));
    },

    fetchAndRenderBio: function() {
      loadJSON("assets/data/bio.json", function(response) {
        this.setBioData(response);
        this.renderBio();
        this.$sections = this.$bioBox.find('section');
        this.eventsAfterBioRender();
      }.bind(this));
    },

    eventsAfterBioRender: function() {
      this.setupMediaQuery();
    },

    setupMediaQuery: function() {
      if (matchMedia) {
        const mq = window.matchMedia("screen and (max-width: 480px)");
        mq.addListener(App.widthChange.bind(this));
        App.widthChange(mq);
      }
    },

    setupAccordion: function() {
      this.$bioBox.find('section + section p').hide();
      this.$sections.first().addClass(this.activeClassName);
    },

    teardownAccordion: function() {
      this.$sections.removeClass(this.activeClassName).find('p').show();
    },

    revealSection: function(e) {
      e.preventDefault();
      var $section = $(e.currentTarget).closest('section');
      var $others = this.$sections.not($section);

      $section.addClass(this.activeClassName);
      $others.removeClass(this.activeClassName);

      $section.find('p').slideDown();
      $others.find('p').slideUp();
    },

    bindFoldSections: function() {
      this.$bioBox.on('click', 'h3', this.revealSection.bind(this));
    },

    unbindFoldSections: function() {
      this.$bioBox.off('click');
    },

    setupAccordionSections: function() {
      this.setupAccordion();
      this.bindFoldSections();
    },

    teardownAccordionSections: function() {
      this.teardownAccordion();
      this.unbindFoldSections();
    },

    init: function() {
      this.fetchAndRenderBio();
    },
  }

  var Skills = {
    $skillBox: $('#skillBox'),
    skillsData: [],
    $skills: null,
    $skillHeadings: $('h3 a[data-skill]'),
    $skillSections: $('section[data-skill]'),
    activeClassName: 'active',

    setSkills: function(response) {
      this.skillsData = response;
    },

    renderSkills: function() {
      this.$skillBox.html(App.templates.skills_template({ skills: this.skillsData }));
      this.$skills = $('.skill');
      this.$skillHeadings = $('h3 a[data-skill]');
      console.log(this.$skillHeadings);
      this.$skillSections = $('section[data-skill]');
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
      $skill.addClass(this.activeClassName);
      this.$skills.not($skill).removeClass(this.activeClassName);

      var skill = $(e.currentTarget).attr('data-skill');
      var $current= this.$skillSections.filter('[data-skill="' + skill + '"]');
      var $others = this.$skillSections.not($current);
      $current.slideDown();
      $others.slideUp();
    },

    bindEvents: function() {
      console.log(this.$skillHeadings);
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

      $otherCards.removeClass('flip')
        .css({ opacity: 0 })
        .delay(1000)
        .animate({ opacity: 1 }, 5000);

        $card.addClass('flip');
      setTimeout(Projects.scrollToCard.bind(Projects, $card), 1100);
    },

    bindEvents: function() {
      $('.skill-list.projects a').on('click', this.navToProjectCard.bind(this));
    },

    init: function() {
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
      scrollTo($card.offset().top - 50, 1000);
    },

    flipCard: function(e) {
      var $cardContainer = $(e.currentTarget);
      $cardContainer.toggleClass("flip");
    },

    bindEvents: function() {
      $('#project-filter :checkbox').on('change', this.filter.bind(this));
      $('#project-filter .checkbox').on('click', this.checkboxChange.bind(this));
      $(".card-container").on('click', this.flipCard.bind(this));
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
    activeClassName: 'active',

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

      scrollTo(0, 500);
      this.activateNavItem(title);
    },

    activateNavItem: function(title) {
      $('nav a').removeClass(this.activeClassName).filter('[data-title=' + title + ']').addClass(this.activeClassName);
    },

    widthChange: function(mq) {
      if (mq.matches) {
        Biography.setupAccordionSections();
      } else {
        Biography.teardownAccordionSections();
      }
    },

    bindEvents: function() {
      $("body").on('click', "a[data-title]", this.getArticleContent.bind(this));
    },

    init: function() {
      this.cacheTemplates();
      this.registerPartials();
      this.removeHandlebarsScripts();
      this.bindEvents();
      Biography.init();
      Skills.init();
      Projects.init();
    },
  };

  App.init();

});
