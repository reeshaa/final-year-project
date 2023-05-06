import cheerio from "cheerio";
import fs from "fs";
import {
  DomNode,
  FormatOptions,
  RecursiveCallback,
  convert
} from "html-to-text";
import { BlockTextBuilder } from "html-to-text/lib/block-text-builder";

const docSize = 1000;

export function chunking(originalHTML: string): string[] {
  console.log("*** NEW CHUNKING PROCESS ***");
  console.log(__dirname);

  const $ = cheerio.load(originalHTML);

  let mainHTML = $("body")?.html() ?? "";
  let articleText: string = convert(mainHTML, {
    formatters: {
      heading: headingFormatter
    },
    selectors: [
      { selector: "h1", format: "heading" },
      { selector: "h2", format: "heading" },
      { selector: "h3", format: "heading" },
      { selector: "h4", format: "heading" },
      { selector: "h5", format: "heading" },
      { selector: "h6", format: "heading" }
    ]
  });
  // Clean up the text
  articleText = articleText.replace(/\n+/g, "\n");
  articleText = articleText.replace(/\t+/g, " ");
  // articleText = articleText.replace(/\s+/g, " ");

  let start = 0;
  let chunks = [];

  // Create chunks of 1000 characters by splitting the articleText on [!!SECTION BREAK!!]
  let _chunkSize = 0;
  let _chunk = "";
  let sections: string[] = articleText.split("[!!SECTION BREAK!!]");
  sections.forEach((section, index) => {
    let _sectionLength = section.length;
    let _chunkLength = _chunk.length;
    if (_chunkLength + _sectionLength < docSize) {
      _chunk += section;
      _chunkSize += _sectionLength;
    } else if (_sectionLength > docSize) {
      let _heading = section.split("\n")[0];
      // get everything after heading
      let _headingLength = _heading.length;
      let _sectionAfterHeading = section.substring(
        _heading.length,
        _sectionLength
      );
      let _pieces = breakSectionIntoPieces(
        _sectionAfterHeading,
        docSize - _headingLength - 2
      );

      //append heading to each piece and add to chunks
      _pieces.forEach((piece, index) => {
        let _piece = _heading.toUpperCase() + ":\n" + piece;
        chunks.push(_piece);
      });

      _chunk = "";
      _chunkSize = 0;
    } else {
      chunks.push(_chunk);
      _chunk = section;
      _chunkSize = _sectionLength;
    }
  });
  chunks.push(_chunk);

  // chunks.forEach((chunk, index) => {
  //   // save each chunk to a file in /chunks/
  //   // saveChunkToFile(chunk, index);
  // });

  return chunks;
}

function saveChunkToFile(htmlFragment: string, index: number) {
  //typically this would invoke an external HTML-digesting API with a payload limit
  //but for this example we'll just write the fragment to a file

  console.log("Processing chunk " + index);
  // fs.open(__dirname + `chunks/chunk${index}.html`, "w", function(err, file) {
  //   if (err) throw err;
  //   console.log("Saved!");
  // });
  fs.writeFileSync(__dirname + `/chunks/chunk${index}.txt`, htmlFragment);
}

function headingFormatter(
  elem: DomNode,
  walk: RecursiveCallback,
  builder: BlockTextBuilder,
  formatOptions: FormatOptions
) {
  builder.openBlock({
    // leadingLineBreaks: formatOptions.leadingLineBreaks || 1
  });
  builder.addInline("[!!SECTION BREAK!!]");
  walk(elem.children, builder);
  builder.closeBlock({
    // trailingLineBreaks: formatOptions.trailingLineBreaks || 1
  });
}

function breakSectionIntoPieces(section: string, maxSize: number) {
  let start = 0;
  let pieces = [];
  // break section into pieces of maxSize, but don't break in the middle of a line
  while (start < section.length) {
    let end = start + maxSize;
    let _piece = section.substring(start, end);
    let _lastNewLine = _piece.lastIndexOf("\n");
    if (_lastNewLine > 0) {
      _piece = _piece.substring(0, _lastNewLine);
      end = start + _lastNewLine;
    }
    pieces.push(_piece);
    start = end;
  }

  return pieces;
}
