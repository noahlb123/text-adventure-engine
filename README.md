# Text Adventure Engine
Welcome to the documentation for the text adventure engine!
This text adventure engine defines a simple system to create text based adventures. This documentation explains how to use the system with examples.

# Quick Start
1. Create a .txt file
2. In the file define a scene name preceded by `#`:

```#First Scene``` 

3. On a newline, define the scene body text between two `/`:

```
#First Scene
/Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;
-Robert Frost/
```
4. Then on newlines below the body, define options. For each option, begin with a `-`, followed by the text the user will see, then a `:` followed by the name of the scene that will result from choosing the option:
```
#First Scene
-Take the road less traveled by: Poem Ending
-Take the bend in the undergrowth: Custom Ending
```
5. After step 4, a scene is complete. The final step is to define new scenes for each option, ensuring that the new scene names exactly match the ones defined in the options. All together this looks like this:
```
#First Scene
/Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;
-Robert Frost/
-Take the road less traveled by: Poem Ending
-Take the bend in the undergrowth: Custom Ending

#Poem Ending
/And that has made all the difference.
-Robert Frost/

#Custom Ending
/I doubted if I should ever come back.
-Robert Frost/
```
6. At this point you can upload the .txt file to the site and experience the user perspective.

That should be all you need to get started! The rest of the documentation provides comprehensive definitions and examples.

# Scenes
All information in the text adventure engine is organized into scenes. A scene is defined by 3 scene components: its scene name (which will never be seen by a user), body text, and (not required:) options.

Requirements:
* Begin with a scene name
* Scene names must be followed by body text
* If options are included, they must be placed after the body text
* Individual scenes must be separated by newlines
* See special characters section

Example:
```

#Birthday scene
/Unfortunately, the clock is ticking
the hours are going by. The past increases, the future recedes. Possibilities decreasing, regrets mounting:
Do you understand?/
-I understand.:choose existentialism
-remain ignorant:choose ignorance
```
# Scene Names
Scene names are the identifiers that connect options to scenes.

Requirements:
* Must begin with `#`
* Must end with a newline
* Must exactly match the scene name in an option, unless its the first scene defined

Examples:
```
# this  isn't  the  same  as  the  other  example
```
```
# this isn't the same as the other example
```

# Body Text
Body text is the only thing the user will see in a scene, unless there are options.

Requirements:
* Must be preceded by a scene name
* Must end and begin with a `/`

Example:
```
# Letter from Birmingham Jail
/I have almost reached the regrettable conclusion that the Negro's great stumbling block in the stride toward freedom is not the White Citizen's Council-er or the Ku Klux Klanner, but the white moderate who is more devoted to "order" than to justice; who prefers a negative peace which is the absence of tension to a positive peace which is the presence of justice; who constantly says "I agree with you in the goal you seek, but I can't agree with your methods of direct action;" who paternalistically feels he can set the timetable for another man's freedom; who lives by the myth of time and who constantly advises the Negro to wait until a "more convenient season." -MLK April 1963/
```
# Options
Options are the interactive component of the text engine that connect scenes together.

Requirements:
* Must be preceded by body text
* Must begin with a `-`
* `-` must be followed by the option text a user will see
* Option text must end with a `:`, and then be followed by a scene name

Example:
```
#Bridge Keeper's Riddle
/What is the air-speed velocity of an unladen swallow?/
-40 miles per hour: Death
-22 meters per second: Death
-What do you mean? An African or European swallow?: Bridge Keeper Dies
```

# Whitespace
Whitespace does matter in the text engine, but it can also be flexible depending on the circumstance. Specifically, the JavaScript `trim()` function is used on each component of a scene, which makes leading and trailing whitespace irrelevant, but means that internal whitespace does matter.

For each of the following scene components, the whitespace that is processed by the code is marked as `☑` and the whitespace that isn't is marked `⌧`:

## Scene Names
Note: No newlines are allowed except one at the end of the scene name.

```
#⌧Scene☑Name⌧
```

## Body Text

```
/⌧
With☑man☑gone,☑will☑there☑be☑hope☑for☑gorilla?☑
☑With☑gorilla☑gone☑will☑there☑be☑hope☑for☑man?☑
-Daniel☑Quinn,☑Ishmael⌧
⌧/
```

## Options
Note: No newlines are allowed except one at the end of the option.

```
/⌧
-☑Cast☑Minor☑Illusion⌧:⌧Escape⌧
⌧
-☑Cast☑Fireball⌧:⌧Death☑by☑fireball⌧
⌧/
```

# Special Characters
The characters used to define each scene component (`#`, `/`, `-`, `:`) cannot be used as normal. Instead these characters must be preceded by the escape character `\` in order for them to function properly within the text of a scene component. Additionally, to display `\` in text, it must be preceded with an additional `\`:

| Proper escape format | Displayed as |
| -------------------- | ------------ |
|\\#                   | #            |
|\\/                   | /            |
|\\-                   | -            |
|\\:                   | :            |
|\\\\                  | \\           |

Example body text (will be displayed as https://en.wikipedia.org/wiki/United_States_Armed_Forces#Budget)
```
/
https\:\/\/en.wikipedia.org\/wiki\/United_States_Armed_Forces\#Budget
/
```
