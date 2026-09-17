# entries/reusable/study-note-three-ways-to-calculate-euclidean-distance-and-understanding-numpy-broadcasting-20260917-1214

## Purpose

Xtest[i, :] - Xtrain — a vector minus a matrix — is not a defined operation in linear algebra, yet NumPy runs it without complaint. This note works out why: a matrix is a stack of row vectors, so v - M is just v minus each row, stacked back the same way. That one reframe turns NumPy broadcasting…

## Current TODO

- None.

## Index

- No subfolders. See the files in this directory.

## Important files

- [entry.json](entry.json)
- [content.md](content.md)

## Changelog

- 2026-09-17 — Imported from Obsidian as Reusable version 1.
