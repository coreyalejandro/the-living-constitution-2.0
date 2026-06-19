# BUCKET 1 FIX — Step-by-Step Instructions

**What this fixes:** The 3 modules that need a GPU (nanochat, governance-harness, autoresearch)
**What you will have when done:** A trained nanochat checkpoint + probe scores on I1-I8
**Total time:** About 30 minutes of waiting, 10 minutes of your attention
**Difficulty:** You only press buttons. No typing required until Step 8.

---

<default-directions>

## BEFORE YOU START — Read this once

There are 14 steps.
Do them in order.
Do not skip any step.
Each step has exactly one action.
When a step says STOP and WAIT, do nothing until you see the exact text described.

---

## STEP 1 — Open your web browser

Open the browser you normally use (Safari, Chrome, Firefox — any of them).

---

## STEP 2 — Go to this exact web address

Click your browser address bar at the top of the screen.
Type exactly this and press Enter:

    https://colab.research.google.com

Wait until the page fully loads. You will see a Google Colab homepage.

---

## STEP 3 — Sign in to Google

If you see a blue button that says "Sign in", click it.
Sign in using the Google account that matches this email:

    corey@coreyalejandro.com

If you are already signed in, skip to Step 4.

---

## STEP 4 — Open the notebook file

Do not close the Colab tab.
Open a new Finder window.
Navigate to this exact folder:

    /Users/coreyalejandro/Projects/the-living-constitution-2.0/modules/nanochat/

You will see a file named:

    INSTALL.ipynb

Drag that file from Finder into the Colab browser tab.
Drop it anywhere on the Colab page.

STOP AND WAIT until the notebook finishes loading.
You will know it is loaded when you see numbered cells appear on the page.

---

## STEP 5 — Connect to a GPU runtime

Look at the top-right corner of the Colab page.
You will see a button. It may say one of these things:
- "Connect"
- "Reconnect"
- A green checkmark with "RAM" and "Disk" bars

If it says "Connect" or "Reconnect":
    Click that button.
    Wait 10 seconds.
    You will see RAM and Disk bars appear.

If you already see RAM and Disk bars:
    Skip to Step 6.

---

## STEP 6 — Switch to a GPU (T4 is free)

Look at the top menu bar of Colab.
Click the word "Runtime".
A dropdown menu will appear.
Click "Change runtime type".
A small window will pop up.
Look for the field that says "Hardware accelerator".
Click the dropdown next to it.
Select "T4 GPU".
Click the blue "Save" button.
The window will close.

STOP AND WAIT 5 seconds.
Then look at the top-right again — you should see RAM and Disk bars.

---

## STEP 7 — Check that Google Drive is connected

This step ensures your trained model gets saved permanently.
Without this, the model disappears when Colab closes.

Look at the left side of the Colab page.
You will see a column of icons.
Click the folder icon (it looks like a folder).
You will see a panel open on the left.
Look for a folder called "drive".

If you see a folder called "drive":
    Google Drive is already connected. Skip to Step 8.

If you do NOT see a folder called "drive":
    Look at the top of that left panel.
    Click the icon that looks like a folder with a Google Drive logo.
    A popup will appear asking permission.
    Click "Connect to Google Drive".
    Another popup will appear asking you to confirm your account.
    Click your email address (corey@coreyalejandro.com).
    Click "Allow".
    STOP AND WAIT until the "drive" folder appears in the left panel.

---

## STEP 8 — Run the entire notebook

Look at the top menu bar.
Click the word "Runtime".
A dropdown menu will appear.
Click "Run all".

A popup may appear that says "Warning: This notebook was not authored by Google."
Click "Run anyway".

STOP AND WAIT.
Do not click anything else.
Do not close the tab.
Do not close your laptop lid (this will pause the run).

You will see cells running one at a time, each showing a spinning circle on the left.
This will take between 15 and 45 minutes depending on the model size selected.
You will know it is done when ALL spinning circles have stopped
AND the last cell shows a green checkmark.

---

## STEP 9 — Find the checkpoint file

When Step 8 is complete:
Look at the left panel (the folder panel from Step 7).
Click on "drive".
Click on "MyDrive".
Click on "nanochat_models".

You will see one or more files with names ending in .pt or .bin
Those are your trained model checkpoints.
Write down (on paper or in a note) the exact name of the most recent file.

Example of what a checkpoint name looks like:
    ckpt_step_5000.pt

---

## STEP 10 — Copy the checkpoint path

Right-click on the checkpoint file in the left panel.
Click "Copy path".
The full path has been copied to your clipboard.
It will look something like:
    /content/drive/MyDrive/nanochat_models/ckpt_step_5000.pt

---

## STEP 11 — Open your terminal

On your Mac, press these two keys at the same time:
    Command + Space

Type the word:
    Terminal

Press Enter.
A black or white terminal window will open.

---

## STEP 12 — Save the checkpoint location to TLC

Type exactly this into the terminal and press Enter.
Replace the path in quotes with the path you copied in Step 10:

    echo "NANOCHAT_CHECKPOINT=/content/drive/MyDrive/nanochat_models/ckpt_step_5000.pt" >> /Users/coreyalejandro/Projects/the-living-constitution-2.0/.env

Note: Use the actual filename you wrote down in Step 9.
The path must match exactly — spelling, capitalization, everything.

---

## STEP 13 — Update the module status in TLC

Type exactly this into the terminal and press Enter:

    cd /Users/coreyalejandro/Projects/the-living-constitution-2.0

Then type this and press Enter:

    node scripts/tlc.mjs

You will see the TLC terminal start up.
Type this at the prompt and press Enter:

    /modules

Look at the line that says NANOCHAT.
It currently says "unverified".

Type this at the prompt and press Enter:

    /done

Follow the prompts. When asked for the module name, type:

    NANOCHAT

When asked for notes, type:

    Checkpoint trained in Colab. Saved to Google Drive. AC-001 complete.

Press Enter.

---

## STEP 14 — Commit the result

Type this at the TLC prompt and press Enter:

    /exit

Now type these commands one at a time in the terminal, pressing Enter after each:

    cd /Users/coreyalejandro/Projects/the-living-constitution-2.0

    git add .env modules/nanochat/

    git commit -m "NANOCHAT: checkpoint trained, AC-001 complete"

    git push origin main

When you see a line that says "main -> main" the push is complete.

---

## YOU ARE DONE WITH BUCKET 1

When Step 14 is complete:
- nanochat has a trained checkpoint
- The checkpoint is saved permanently in your Google Drive
- TLC 2.0 registry is updated
- The change is on GitHub

The next step after this (Bucket 2 — LLM Council with OpenRouter) is already
unlocked. Your OpenRouter key was saved in a previous session.
To activate the council, start TLC and type /council.

</default-directions>

---

## IF SOMETHING GOES WRONG

Do not try to fix it yourself. Come back to this terminal (Hermes)
and say exactly what you saw on screen. Copy the exact error message.
That is all you need to do. I will diagnose it from there.

The most common problems and what they look like:

PROBLEM: Colab says "Runtime disconnected"
WHAT TO DO: Click Runtime → Run all again. Do not close the tab.

PROBLEM: A cell shows a red error message
WHAT TO DO: Screenshot it or copy the text. Bring it back here.

PROBLEM: "drive" folder never appears in Step 7
WHAT TO DO: Refresh the Colab page (Command + R) and try Step 7 again.

PROBLEM: No .pt or .bin files in Step 9
WHAT TO DO: Go back to Step 8. The run may not have completed.
Look for the last cell and check if it has a green checkmark or a red X.

---

## WHAT EACH PIECE IS — PLAIN LANGUAGE

nanochat is a small language model that you will own completely.
You train it. You control it. No API key needed after training.
It is the model that TLC 2.0 uses to run local governance decisions
without sending anything to Anthropic, OpenAI, or anyone else.

The governance-harness probes (I1-I8) run against this checkpoint.
Once you have the checkpoint, those probes can run and produce real scores.
Those real scores are the evidence that makes those modules no longer unverified.

That is the chain: train nanochat → run probes → get scores → update truth_status.
All three unverified modules advance with one Colab session.
