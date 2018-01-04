var cardData = [
  {
    "name": "Calculator!",
    "imgSource": "https://drive.google.com/thumbnail?id=1C7RQY_ASCtqR2qfXdEP786AXZE0OPX2g",
    "locationLive": "https://codepen.io/ahenegar/full/ypyGax",
    "locationSource": "https://codepen.io/ahenegar/pen/ypyGax",
    "locationLiveTitle": "Live Site",
    "locationSourceTitle": "CodePen Source Code",
    "skills": [
      "HTML & CSS",
      "pure JavaScript"
    ],
    "features": [
      "Stack-like input handles multiple operations at once.",
      "Programmed from scratch with pure JavaScript.",
      "Clean design"
    ],
  },
  {
    "name": "PostIt!",
    "imgSource": "https://drive.google.com/thumbnail?id=1PvT8fS06oZ6sWG6WNMHP5agkHY8ceBL7",
    "locationLive": "https://postit-301.herokuapp.com/",
    "locationSource": "https://github.com/AJDot/301_postit",
    "locationLiveTitle": "Live Site",
    "locationSourceTitle": "GitHub Source Code",
    "skills": [
      "Ruby on Rails"
    ],
    "features": [
      "Relational Database & MVC",
      "Partials, Helpers, Filters",
      "Validations, Authentication (from scratch)",
      "Forms, AJAX, URL Slugging",
      "Creating Gems, Building APIs",
    ],
  },
  {
    "name": "Dictionary",
    "imgSource": "https://drive.google.com/thumbnail?id=1v26TEQBWzwVGT-nyNSYfPA7UY7q_Gq9O",
    "locationLive": "https://preview.c9users.io/ajdot/dictionary/index.html?_c9_id=livepreview2&_c9_host=https://ide.c9.io",
    "locationSource": "https://github.com/AJDot/dictionary",
    "locationLiveTitle": "Live Site",
    "locationSourceTitle": "GitHub Source Code",
    "skills": [
      "HTML & CSS",
      "pure JavaScript"
    ],
    "features": [
      "Making/handling AJAX requests",
      "Working with 3rd APIs",

    ],
  }
];

$(function() {
  var $articles = $('.content article');


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
    templates: {},

    cardData: cardData,

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

    renderCards: function() {
      this.$cardBox.html(this.templates.cards_template({ cards: this.cardData }));
    },

    init: function() {
      this.cacheTemplates();
      this.registerPartials();
      this.removeHandlebarsScripts();
      this.renderCards();

    },
  }

  var App = {

    getArticleContent: function(e) {
      var $a = $(e.currentTarget);
      var title = $a.attr('data-title');

      $articles.fadeOut(400);
      $articles.filter('[data-title=' + title + ']').delay(400).fadeIn(400);
    },

    bindEvents: function() {
      $("a[data-title]").on('click', this.getArticleContent);
    },

    init: function() {
      this.bindEvents();
      Experience.init();
      Projects.init();
    },
  };

  App.init();

});
