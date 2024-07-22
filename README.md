# Recorder Notes

This is a small page, that shows the notes and finger positioning on a recorder flute.

I'm doing this because I always go back and check the notes on [Basic Fingering](https://en.wikipedia.org/wiki/Recorder_(musical_instrument)#Basic_fingering)
table on Wikipedia.

## Features:

 - You can select notes, and then request to hide them.
 - When you change the tuning, you can select if you the selected notes are carried over to the other tuning by position or by note.
 - You get the "sheet" with the notes position in the stave, so you can learn to identify them visually on the stave.
 - We have a parametrized list of scales with the scales in integer notation so you can visualize the positions for them, based on this [Wikipedia's List of musical scales and modes](https://en.wikipedia.org/wiki/List_of_musical_scales_and_modes)

## Contributions

You can go and modify the `scales.json` file with comments about the scale in question.

Fun facts could be "Certain song uses in this scale based on C" (for example)

## Technical stuff about the app

This is a single file application, which basically calls for a full rerender whenever anything happens, and becasue it's small enough we can get away with it.

If you see anything wrong please let me know with an issue or a PR fix.

## Musical stuff about hte app

If you see anything wrong, please please please, let me know on a GitHub issue.