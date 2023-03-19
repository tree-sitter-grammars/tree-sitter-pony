#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType {
  TYPE_ARGS_START,
  BLOCK_COMMENT,

  MULTILINE_STRING_CONTENT,
};

void *tree_sitter_pony_external_scanner_create() { return NULL; }

void tree_sitter_pony_external_scanner_destroy(void *payload) {}

void tree_sitter_pony_external_scanner_reset(void *payload) {}

unsigned tree_sitter_pony_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  return 0;
}

void tree_sitter_pony_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {}

int quote_count = 0;

bool tree_sitter_pony_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {

  // We ACCEPT [ if there's whitespace but NO newline, otherwise ignore
  // and let the internal grammar handle it as an array literal
  if (valid_symbols[TYPE_ARGS_START]) {
    while (iswspace(lexer->lookahead) && lexer->lookahead != '\0' &&
           lexer->lookahead != '\n') {
      lexer->advance(lexer, false);
    }

    if (lexer->lookahead == '[') {
      lexer->advance(lexer, false);
      lexer->result_symbol = TYPE_ARGS_START;
      return true;
    }
  }

  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

  // Multiline string content can have anything,
  // escape sequences are just parsed as two characters
  if (valid_symbols[MULTILINE_STRING_CONTENT]) {
    bool has_content = false;
    lexer->result_symbol = MULTILINE_STRING_CONTENT;

    for (;;) {
      switch (lexer->lookahead) {
      case '"':
        lexer->mark_end(lexer);
        // This outer if statement is to handle a fresh state without prior
        // knowledge of quotes
        if (quote_count == 0) {
          while (lexer->lookahead == '"') {
            lexer->advance(lexer, false);
            quote_count++;
          }

          if (quote_count > 3) {
            // Trigger the external scanner again for a state
            // where we know the quote count from before
            return true;
          } else if (quote_count == 3) {
            // We have a triple quote aka the end, so we can return
            quote_count = 0;
            return has_content;
          } else {
            // we have a single or double quote, so we need to keep going
            // this is just content in the multiline string, so extend the
            // current token with `mark_end`
            lexer->mark_end(lexer);
            quote_count = 0;
            has_content = true;
          }
          // This else if is to handle the case where we have a quote count > 0
          // beforehand, and need to see if some of this just might be content,
          // that is, only if there's more than 3 quotes in a row
        } else if (quote_count > 3) {
          // We returned from the last iteration with a quote count > 3, so we
          // must mark n-3 quotes as content
          for (int i = 0; i < quote_count - 3; i++) {
            lexer->advance(lexer, false);
          }
          // Extend the current token with `mark_end`
          lexer->mark_end(lexer);
          quote_count = 0;
          has_content = true;
          return true;
          // This else if is to handle the case where we have a quote count == 3
          // from the last iteration
        } else if (quote_count == 3) {
          // We have a triple quote aka the end, so we can return
          quote_count = 0;
          return has_content;
          // This else is to handle the case where we have a
          // quote count == 1 or 2, just extend the current token
        } else {
          lexer->mark_end(lexer);
          quote_count = 0;
          // We know we have a single or double quote, so we need to keep going,
          // mark has_content as true
          has_content = true;
        }
        break;
      case '\0':
        if (lexer->eof(lexer)) {
          return false;
        }
        lexer->advance(lexer, false);
        has_content = true;
        break;
      default:
        lexer->advance(lexer, false);
        has_content = true;
        break;
      }
    }
  }

  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

  if (lexer->lookahead == '/') {
    lexer->advance(lexer, false);
    if (lexer->lookahead != '*')
      return false;
    lexer->advance(lexer, false);

    bool after_star = false;
    unsigned nesting_depth = 1;
    for (;;) {
      switch (lexer->lookahead) {
      case '\0':
        return false;
      case '*':
        lexer->advance(lexer, false);
        after_star = true;
        break;
      case '/':
        if (after_star) {
          lexer->advance(lexer, false);
          after_star = false;
          nesting_depth--;
          if (nesting_depth == 0) {
            lexer->result_symbol = BLOCK_COMMENT;
            return true;
          }
        } else {
          lexer->advance(lexer, false);
          after_star = false;
          if (lexer->lookahead == '*') {
            nesting_depth++;
            lexer->advance(lexer, false);
          }
        }
        break;
      default:
        lexer->advance(lexer, false);
        after_star = false;
        break;
      }
    }
  }

  return false;
}
