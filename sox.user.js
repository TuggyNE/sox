// ==UserScript==
// @name         Stack Overflow Extras (SOX)
// @namespace    https://github.com/soscripted/sox
// @version      DEV
// @description  Adds a bunch of optional features to sites in the Stack Overflow Network.
// @contributor  ᴉʞuǝ (stackoverflow.com/users/1454538/)
// @contributor  ᔕᖺᘎᕊ (stackexchange.com/users/4337810/)
// @updateURL    https://rawgit.com/soscripted/sox/master/sox.user.js
// @match        *://*.stackoverflow.com/*
// @match        *://*.stackexchange.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @require      https://code.jquery.com/jquery-2.1.4.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js
// @require      https://cdn.rawgit.com/timdown/rangyinputs/master/rangyinputs-jquery-src.js
// @require      https://cdn.rawgit.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js
// @require      https://cdn.rawgit.com/camagu/jquery-feeds/master/jquery.feeds.js
// @require      https://rawgit.com/soscripted/sox/master/sox.helpers.js
// @require      https://rawgit.com/soscripted/sox/master/sox.features.js
// @resource     settingsDialog https://rawgit.com/soscripted/sox/master/sox.settings-dialog.html
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_getResourceText
// ==/UserScript==
/*jshint multistr: true */
(function(sox, $, undefined) {
    const SOX = "Stack Overflow Extras";
    const SOX_SETTINGS = "SOXSETTINGS";


    var $settingsDialog = $(GM_getResourceText("settingsDialog")),
        $soxSettingsDialog = $settingsDialog.find("#sox-settings-dialog"),
        $soxSettingsDialogFeatures = $settingsDialog.find("#sox-settings-dialog-features"),
        $soxSettingsSave = $settingsDialog.find("#sox-settings-dialog-save"),
        $soxSettingsReset = $settingsDialog.find("#sox-settings-dialog-reset"),
        $soxSettingsClose = $settingsDialog.find("#sox-settings-dialog-close");

    sox.init = function() {

        // add extra CSS file and font-awesome CSS file
        $("head").append("<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css'>")
            .append("<link rel='stylesheet' type='text/css' href='https://rawgit.com/soscripted/sox/master/sox.css' />");
        $("body").append($settingsDialog);

        loadFeatures(); //load all the features in the settings dialog

        // add settings icon to navbar
        var $soxSettingsButton = $("<a/>", {
                id: "soxSettingsButton",
                class: "topbar-icon",
                style: "background-image: none; padding: 10px 0 0 10px; font-size: 14px; color: #999;",
                title: "Change sox Settings",
                click: function(e) {
                    e.preventDefault();
                    $("#sox-settings-dialog").toggle();
                }
            }),
            $icon = $("<i/>", {
                class: "fa fa-cogs"
            });
        $soxSettingsButton.append($icon).appendTo("div.network-items");

        // add click handlers for the buttons in the settings dialog
        $soxSettingsClose.on("click", function() {
            $soxSettingsDialog.hide();
        });
        $soxSettingsReset.on("click", function() {
            reset();
            location.reload(); // reload page to reflect changed settings
        });
        $soxSettingsSave.on("click", function() {
            extras = [];
            $soxSettingsDialogFeatures.find('input[type=checkbox]:checked').each(function() {
                var x = $(this).attr('id');
                extras.push(x); //Add the function's ID (also the checkbox's ID) to the array
            });
            save(extras);
            location.reload(); // reload page to reflect changed settings
        });

        // check if settings exist and execute desired functions
        if (isAvailable()) {
            extras = getSettings();
            if (isDeprecated()) { //if the setting is set but a deprecated, non-existent feature exists, then delete the setting and act as if it is new
                reset();
            } else {
                for (i = 0; i < extras.length; ++i) {
                    console.log(extras[i]);
                    $('#sox-settings-dialog #' + extras[i]).prop('checked', true);
                    features[extras[i]](); //Call the functions that were chosen
                }
            }
        } else {
            // no settings found, mark all inputs as checked and display settings dialog
            $soxSettingsDialogFeatures.find("input").prop("checked", true);
            $soxSettingsDialog.show(); //not working -- why!?
        }

    };

    function isAvailable() {
        //return ~GM_getValue("sox-featureOptions", -1) ? false : true;
        return (GM_getValue(SOX_SETTINGS, -1) == -1 ? false : true);
    }

    function getSettings() {
        return JSON.parse(GM_getValue(SOX_SETTINGS));
    }

    function reset() {
        GM_deleteValue(SOX_SETTINGS);
    }

    function save(options) {
        GM_setValue(SOX_SETTINGS, JSON.stringify(options));
        console.log("sox settings saved: " + JSON.stringify(options));
    }

    function isDeprecated() { //checks whether the saved settings contain a deprecated feature
        //TODO: add function names to an array and loop instead of || .. || .. ||
        settings = getSettings();
        if (settings.indexOf('answerCountSidebar') != -1 ||
            settings.indexOf('highlightClosedQuestions') != -1 ||
            settings.indexOf('unHideAnswer') != -1 ||
            settings.indexOf('flaggingPercentages') != -1) {
            return true;
        }
    }

    function addFeatures(features) {
        $.each(features, function(i, o) {
            var $div = $("<div/>"),
                $label = $("<label/>"),
                $input = $("<input/>", {
                    id: o[0],
                    "type": "checkbox",
                    style: "margin-right: 5px;"
                });
            $div.append($label);
            $label.append($input);
            $input.after(o[1]);
            $soxSettingsDialogFeatures.append($div);
        });
    }

    function addCategory(name) {
        var $div = $("<div/>"),
            $h3 = $("<h3/>", {
                text: name
            });
        $div.append($h3);
        $soxSettingsDialogFeatures.append($div);
    }

    function loadFeatures() {
        addCategory("Appearance");
        addFeatures([
            ["grayOutVotes", "Gray out deleted votes"],
            ["moveBounty", "Move 'start bounty' to top"],
            ["dragBounty", "Make bounty box draggable"],
            ["renameChat", "Prepend 'Chat - ' to chat tabs' titles"],
            ["exclaim", "Remove exclamation mark on message"],
            ["employeeStar", "Add star after employee names"],
            ["bulletReplace", "Replace triangluar bullets with normal ones"],
            ["addEllipsis", "Add ellipsis to long names"],
            ["fixedTopbar", "Fix topbar position"],
            ["displayName", "Display name before gravatar"],
            ["unspoil", "Add a link to show all spoilers in a post"],
            ["spoilerTip", "Differentiate spoilers from empty blockquotes"],
            ["stickyVoteButtons", "Make vote buttons next to posts sticky whilst scrolling on that post"],
            ["betterCSS", "Add extra CSS for voting signs and favourite button (currently only on Android SE)"],
            ["standOutDupeCloseMigrated", "Add colourful, more apparent signs to questions that are on hold, duplicates, closed or migrated on question lists"],
            ["colorAnswerer", "Color answerer's comments"],
            ["highlightQuestions", "Alternate favourite questions highlighing"],
            ["metaNewQuestionAlert", "Add an extra mod diamond to the topbar that alerts you if there is a new question posted on the child-meta of the current site"],
            ["hideHotNetworkQuestions", "Hide the Hot Network Questions module"],
            ["hideHireMe", "Hide the Looking for a Job module"],
            ["hideCommunityBulletin", "Hide the Community Bulletin module"]
        ]);

        addCategory("Flags");
        addFeatures([
            ["flagOutcomeTime", "Show the flag outcome time when viewing your Flag History"],
            ["flagPercentages", "Show flagging percentages for each type in the Flag Summary"]
            // lots more to come
        ]);

        addCategory("Editing");
        addFeatures([
            ["kbdAndBullets", "Add KBD and list buttons to editor toolbar"],
            ["editComment", "Pre-defined edit comment options"],
            ["editReasonTooltip", "Add a tooltip to posts showing the latest revision's comment on 'edited [date] at [time]'"],
            ["addSBSBtn", "Add a button the the editor toolbar to start side-by-side editing"],
            ["linkQuestionAuthorName", "Add a button in the editor toolbar to insert a hyperlink to a post and add the author automatically"],
            ["titleEditDiff", "Make title edits show seperately rather than merged"]
        ]);
        addCategory("Comments");

        addFeatures([
            ["moveCommentsLink", "Move 'show x more comments' to the top"],
            ["commentShortcuts", "Use Ctrl+I,B,K (to italicise, bolden and add code backticks) in comments"],
            ["quickCommentShortcutsMain", "Add shortcuts to add pre-defined comments to comment fields"],
            ["commentReplies", "Add reply links to comments for quick replying (without having to type someone's username)"],
            ["autoShowCommentImages", "View linked images (to imgur) in comments inline"],
            ["showCommentScores", "Show your comment and comment replies scores in your profile tabs"]
        ]);

        addCategory("Unsorted");
        addFeatures([
            //other
            ["shareLinksMarkdown", "Change 'share' link to format of [post-name](url)"],
            ["parseCrossSiteLinks", "Parse titles to links cross-SE-sites"],
            ["confirmNavigateAway", "Add a confirmation dialog before navigating away on pages whilst you are still typing a comment"],
            ["sortByBountyAmount", "Add an option to filter bounties by their amount"],
            ["isQuestionHot", "Add a label on questions which are hot-network questions"],
            ["answerTagsSearch", "Show tags for the question an answer belongs to on search pages (for better context)"],
            ["metaChatBlogStackExchangeButton", "Show meta, chat and blog buttons on hover of a site under the StackExchange button"],
            ["alwaysShowImageUploadLinkBox", "Always show the 'Link from the web' box when uploading an image"],
            ["addAuthorNameToInboxNotifications", "Add the author's name to notifications in the inbox"],
            ["scrollToTop", "Add Scroll To Top button"],
            ["linkedPostsInline", "Display linked posts inline (with an arrow)"]
        ]);
    }

}(window.sox = window.sox || {}, jQuery));

// initialize sox
sox.init(); //TODO: not sure if we really need this to be a function, script is wrapped in IIFE so init code could just go at the top.