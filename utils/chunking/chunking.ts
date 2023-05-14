import cheerio, { CheerioAPI } from "cheerio";
import fs from "fs";
import {
  DomNode,
  FormatOptions,
  RecursiveCallback,
  convert
} from "html-to-text";
import { BlockTextBuilder } from "html-to-text/lib/block-text-builder";

const docSize = 1000;

/**
 * Break the HTML into meaningful chunks based on headings and sections
 *
 * @param originalHTML - Raw HTML downloaded from the web
 * @returns an array of chunks
 */
export function ChunkTheHTML(originalHTML: string): string[] {
  console.log("*** NEW CHUNKING PROCESS ***");

  const $ = cheerio.load(originalHTML);

  let pageMetadata = extractDocumentMetadata($);

  // let mainHTML = $("body")?.html() ?? "";
  let mainHTML = $("#main-content").html() ?? ""; // Use this line if you want to ignore the navbar and all

  let mainHTMLAsText: string = convert(mainHTML, {
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
  mainHTMLAsText = mainHTMLAsText.replace(/\n+/g, "\n");
  mainHTMLAsText = mainHTMLAsText.replace(/\t+/g, " ");
  // mainHTMLAsText = mainHTMLAsText.replace(/\s+/g, " ");

  let chunks = [];

  // Create chunks of docsize characters by splitting the mainHTMLAsText on [!!SECTION BREAK!!]
  let _chunkSize = 0;
  let _chunk = "";
  let sections = mainHTMLAsText.split("[!!SECTION BREAK!!]");

  sections.forEach((section, index) => {
    let _sectionLength = section.length;
    let _chunkLength = _chunk.length;
    if (_chunkLength + _sectionLength < docSize) {
      /**
       * If the section is smaller than the docSize, we can just add it to the chunk
       */
      _chunk += section;
      _chunkSize += _sectionLength;
    } else if (_sectionLength > docSize) {
      /**
       * If the section is larger than the docSize, we need to break it into pieces
       * and append the heading to each piece
       */

      let _heading = section.split("\n")[0];
      let _headingLength = _heading.length;

      // Extract the contents of the section after the heading
      let _sectionAfterHeading = section.substring(
        _heading.length,
        _sectionLength
      );

      /**
       * break the section into pieces of `docSize - headingLength - 2` characters
       * (the -2 is for the colon and newline)
       */
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
  // Add the remaining chunk to the array
  if (_chunk.trim().length > 0) chunks.push(_chunk); // Don't add empty chunks

  /**
   * Prefix each chunk with the page metadata
   */
  chunks.forEach((chunk, index) => {
    let metadataPadding = `(${pageMetadata.pageTitle})`;
    // if (pageMetadata.heading1.length > 0)
    //   metadataPadding += ` (${pageMetadata.heading1}) `;
    if (pageMetadata.heading2.length > 0)
      metadataPadding += ` (${pageMetadata.heading2}) `;

    chunks[index] = metadataPadding + chunk;
  });

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

/**
 * Custom formatter for headings
 *
 * This formatter adds a [!!SECTION BREAK!!] before each heading
 * This is used to split the document into chunks later
 */
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

/**
 * Break a section into pieces of maxSize, but don't break in the middle of a line
 * @param section - the section to break
 * @param maxSize - the maximum size of each piece
 * @returns  an array of pieces
 */
function breakSectionIntoPieces(section: string, maxSize: number): string[] {
  let start = 0;
  let pieces: string[] = [];
  // break section into pieces of maxSize, but don't break in the middle of a line
  while (start < section.length) {
    let end = start + maxSize;
    let _piece = section.substring(start, end);
    let _lastNewLine = _piece.lastIndexOf("\n");
    if (_lastNewLine > 0) {
      _piece = _piece.substring(0, _lastNewLine);
      end = start + _lastNewLine;
    }
    if (_piece.trim().length > 0) pieces.push(_piece); // don't add empty pieces
    start = end;
  }

  return pieces;
}

/**
 * Extract the page title and first two headings from the document
 */
function extractDocumentMetadata($: CheerioAPI): {
  pageTitle: string;
  heading1: string;
  heading2: string;
} {
  let pageTitle = $("title").text();
  let heading1 = $("h1").first().text().trim();
  let heading2 = $("h2").first().text().trim();

  console.log("pageTitle: " + pageTitle);
  console.log("heading1: " + heading1);
  console.log("heading2: " + heading2);

  return {
    pageTitle,
    heading1,
    heading2
  };
}
