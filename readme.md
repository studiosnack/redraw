# redraw

![a screenshot of this app](https://github.com/studiosnack/redraw/blob/main/appscreen.png?raw=true)

redraw is a sort of hastily implemented electron app that scratches several itches:
1. it saves its file content in a mac package/dir
1. its whole purpose is to act as a catalog of clothes that you can (eventually) search and be able to answer dumb questions like 
  - in levis, do i wear 31w or 32w
  - actually, do i even wear my levis ever?? 
  - if not, what _are_ my workhorse items?

some of these questions are inspired by the episode of [Articles of Interest](https://99percentinvisible.org/aoi/) entitled [how to dress](https://articlesofinterest.substack.com/p/how-to-dress) but they are also inspired by a personal desire to tame the wardrobes of me and my kids whe seemingly always have Too Many Clothes and somehow Not Enough Clothes.

There's also the possibility that this is sort of like That Application from Clueless, but that's not really a Design Goal.

A lot of this is really about getting to understand what the rough edges in electron are and the big one i found is that [Recent Documents just flat out does not work for me in Sonoma](https://github.com/electron/electron/issues/40611). That sort of discovery led me to just wonder if electron is not really just a better prototyping platform to work through the most coarsest ui/ux questions before just building it in something like swiftui or appkit. I suppose in that sense, this app is a success even though it's still very unfinished.

Also, apologies to anyone if you were using .rdrw as an extension, i just made it up for this, but like, it's not like it matters unless you install this...

there is one major goal however in the current ui/ux or whatever, it's that you just sometimes want to create a rough catalog and you don't need photos or detailed information, you can embed a lot of that in the name of the item and just move on with your life. for what it's worth, i've tried doing this in airtable and it's somehow even just more arduous than this, so i don't know what that says about the problem domain.

✌🏼

## .rdrw package contents

a redraw database is made of two files (for now)
- config.json
- meta.json

the config.json file is the most interesting and it looks a lot like the redux state serialized to disk. oops!

**config.json**
```typescript
type RdrwConfig = {
  mainstore: RootState,
}
```
where `RootState` is basically this https://github.com/studiosnack/redraw/blob/main/src/reducer.ts#L29-L34

the meta.json file is less interesting, i added it once i realized _i could_ because i had a problem where i had two versions of config.json and knew that i would probably want to upgrade them to a single version (or even a sqlite backed version...) later.

**meta.json**
```typescript
type RdrwMeta = {
  version: 1
}
```

right now there is only version 1, i'm sure that will probably never change and end up being a huge pain for me.

## Release

i'm providing a release here, but like, it's not great, but if you're trying to do something like this for yourself (i.e. persist redux to some bundle you can serde yourself back from) then maybe it's useful for you, the actual sidebar stuff and the non-design of the rest is not super compelling i'm sorry to say.
