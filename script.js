const NotesSharpBase = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
const NotesFlatBase = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
function NotesToWithOctave(notes, octave) { return notes.map(note => (`${note}${octave}`)) }
const NotesSharp = Array.from({ length: 9 }).map((_, i) => (NotesToWithOctave(NotesSharpBase, i + 1))).reduce((prev, cur) => [...prev, ...cur], [])
const NotesFlats = Array.from({ length: 9 }).map((_, i) => (NotesToWithOctave(NotesFlatBase, i + 1))).reduce((prev, cur) => [...prev, ...cur], [])
const octaves = ["low", "mid", "high"];

function TableBody() {
    return document.querySelector("table tbody");
}

function PositionRows() {
    return Array.from(document.querySelectorAll("table tbody tr"));
}

function NotesOnView() {
    return (
        PositionRows()
        .filter(row => row.dataset.selected === "true")
        .filter(row => row.hidden === false)
        .map(row => row.querySelector("th").innerHTML)
    )
}

function FollowNotes() {
    return (document.querySelector("input[name='selection-follow']:checked").value === "note")
}

function NotesBase() {
    return (document.querySelector("input[name='tone-flat-sharp']:checked").value === "flat") ? NotesFlatBase : NotesSharpBase;
}

function ScaleSelectNoteOptions(roots) {
    const select = document.querySelector("select[name='scale-note']")
    select.innerHTML = ""
    roots.map(root => {
        const option = document.createElement("option");
        option.value = root;
        option.innerHTML = root;
        select.appendChild(option);
    })
}

function ScaleDetailsView(scale) {
    const comments = 
            scale.comments.map(comment => `<li>${comment}</li>`).join("\n");
    const integers = scale.integers.map(i => i.toString()).join(", ");

    const returnable = `
        <h1>${scale.name}</h1>
        <p><span>Integer Notation: </span>${integers}</p>\n
        <ul>${comments}</ul>
    `
    return returnable;
}


function DrawStave() {
    const VF = Vex.Flow;
    const element = document.getElementById("vexflow");
    element.innerHTML = "";
    const renderer = new VF.Renderer(element, VF.Renderer.Backends.SVG);
    renderer.resize(400, 200);
    const tuning = window.tuning;
    const context = renderer.getContext();
    const stave = new VF.Stave(5, 50, 385);
    let octave_shift = 0;
    switch (tuning) {
        case "C5":
            stave.addClef("treble", undefined, "8va");
            octave_shift = 1;
            break;
        case "F4":
            stave.addClef("treble");
            //octave_shift = 1;
            break;
        case "C4":
            stave.addClef("treble");
            break;
        case "F3":
            stave.addClef("bass", undefined, "8vb");
            octave_shift = 1;
            break;
    }

    const notes = (
        NotesOnView()
            .map(e =>
                (e.slice(0, -1) + "/" + e.slice(-1))
                    .replace(/♯/g, "#")
                    .replace(/♭/g, "b")
            )
    )
    console.log({tuning, notes});
    stave.setContext(context).draw();
    if (notes.length) {
        const voice = new VF.Voice({ num_beats: notes.length, beat_value: 4 });
        voice.addTickables(
            notes.map(note => {
                const staveNote = new VF.StaveNote({
                    keys: [note],
                    duration: "q",
                    clef: stave.clef,
                    octave_shift,
                })

                function renderStaveNote() {
                    return staveNote;
                }

                renderStaveNote();
                if (note.includes("#"))
                    staveNote.addModifier(new VF.Accidental('#'))
                if (note.includes("b"))
                    staveNote.addModifier(new VF.Accidental('b'))
                return staveNote
            })
        )
        const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 300);
        voice.setStave(stave);
        voice.draw(context, stave);
    }

}

function BaseNoteShift(event) {
    const base = document.querySelector(`input[name="tuning"]:checked`).value;
    const notation = document.querySelector(`input[name="tone-flat-sharp"]:checked`).value
    const notes = notation == "flat" ? NotesFlats : NotesSharp;
    const roots = notation == "flat" ? NotesFlatBase : NotesSharpBase;
    ScaleSelectNoteOptions(roots);

    const index = notes.indexOf(base);

    PositionRows().forEach((row, i) => {
        row.querySelector("th").innerHTML = notes[index + i];
    })

    if (window.tuning && FollowNotes()) {
        const shift = notes.indexOf(window.tuning) - notes.indexOf(base);
        const selected = []
        PositionRows().forEach(row => {
            if (row.dataset.selected === "true") {
                selected.push(parseInt(row.dataset.position));
            }
            row.dataset.selected = "false";
        })
        const shifted = selected.map(position => position + shift).filter(position => 0 <= position && position <= notes.length);
        PositionRows().filter(row => shifted.includes(parseInt(row.dataset.position))).forEach(row => {
            row.dataset.selected = "true";
        })
    }
    window.tuning = base;
    HidePosition();
    DrawStave();
}

function HidePosition(event) {
    const display = octaves.reduce((acc, octave) => (
        {
            ...acc,
            [octave]: document.querySelector(`input[name="octave-${octave}"]`).checked
        }
    ), {})
    display.selectedOnly = hide = document.querySelector(`input[name="selection-hide"]`).checked
    
    TableBody().dataset.selectedOnly = display.selectedOnly ? "true" : "false";
    
    PositionRows().forEach(row => {
        const displayStatus = row.dataset.octave.split(" ").reduce(
            (acc, octave) => acc || display[octave],
            false,
        )
        if (display.selectedOnly) {
            row.hidden = !(displayStatus && row.dataset.selected === "true");
        }
        else {
            row.hidden = !displayStatus;
        }
    });
}


window.addEventListener("load", () => {


    window.scales = [];
    fetch("/scales.json").then(response => response.json()).then(data => {
        window.scales = data;
        const select = document.querySelector("select[name='scale-scale']");
        data.map((scale, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.innerHTML = scale.name;
            select.appendChild(option);
        });
    })


    document.querySelector("button[name='scale-show']").addEventListener("click", event => {
        const index = document.querySelector("select[name='scale-scale']").value;
        const scale = window.scales[index];
        const root = document.querySelector("select[name='scale-note']").value;
        const notes = NotesBase()
        const root_index = notes.indexOf(root)
        const notes_indexs = scale.integers.map(i => (i + root_index) % 12)
        const notes_selected = notes_indexs.map(i => notes[i]); 
        PositionRows().forEach(row => {
             row.dataset.selected = "false";
        })
        
        PositionRows().forEach(row => {
            const current_note = row.querySelector("th").innerHTML; 
            row.dataset.selected = notes_selected.reduce(
                (acc, cur) => acc || current_note.slice(0, -1) === (cur), false
            ) ? "true" : "false";
        })

        BaseNoteShift();
        document.getElementById("scale-details").innerHTML = ScaleDetailsView(scale);
    })


    PositionRows().forEach(row => {
        row.addEventListener("click", event => {
            row.dataset.selected = row.dataset.selected === "true" ? "false" : "true";
            BaseNoteShift();
        })
    })
    octaves.map(octave => {
        document
            .querySelector(`input[name="octave-${octave}"]`)
            .addEventListener("change", BaseNoteShift);
    });
    document
        .querySelector(`input[name="selection-hide"]`)
        .addEventListener("change", BaseNoteShift);

    document.querySelectorAll("input[name='tuning']").forEach(input => {
       input.addEventListener("change", BaseNoteShift); 
    })
    document.querySelectorAll("input[name='tone-flat-sharp']").forEach(input => {
       input.addEventListener("change", BaseNoteShift); 
    })
    BaseNoteShift();
});